import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();
import { SUBSCRIPTIONS_CONFIG } from "../config";
import fs from "fs";
import { getAllPrices } from "./prices";

interface ISubscriptionListRequestParams {
  limit: number;
  starting_after?: string;
  price?: string;
}

// Stripe configuration and initialisation
const PAGE_SIZE = 100;
const SOURCE_STRIPE_SECRET_KEY: string = process.env
  .SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env
  .DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

export function convertToSubscriptionCreateParams(
  subscription: Stripe.Subscription
): Stripe.SubscriptionCreateParams {
  let customer_id;
  if (typeof subscription.customer === "object") {
    customer_id = subscription.customer.id;
  } else {
    customer_id = subscription.customer;
  }

  let createSubscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: customer_id as string,
  };


  if (subscription.currency) {
    createSubscriptionParams.currency = subscription.currency;
  }

  /* this can cause unwanted behavior, not setting will use the default payment method
  if (typeof subscription.default_payment_method === "object") {
    createSubscriptionParams.default_payment_method =
      subscription.default_payment_method?.id;
  }*/

  if (subscription.description) {
    createSubscriptionParams.description = subscription.description;
  }

  const items_formated: Stripe.SubscriptionCreateParams.Item[] =
    subscription.items.data.map((item) => {
      let params: Partial<Stripe.SubscriptionCreateParams.Item> = {};

      if (item.billing_thresholds?.usage_gte) {
        params.billing_thresholds = {
          usage_gte: item.billing_thresholds.usage_gte,
        };
      }

      if (item.metadata) {
        params.metadata = item.metadata;
      }

      if (item.price) {
        params.price = item.price.id;
      }

      // The quantity check is correct.
      if (item.quantity) {
        params.quantity = item.quantity;
      }

      // The tax_rates check is correct.
      if (item.tax_rates) {
        params.tax_rates = item.tax_rates.map((tax_rate) => tax_rate.id);
      }

      return params; // TypeScript now knows the structure of params
    });

  if (subscription.items) {
    createSubscriptionParams.items = items_formated;
  }

  if (subscription.items) {
    createSubscriptionParams.items = items_formated;
  }

  if (subscription.metadata) {
    createSubscriptionParams.metadata = subscription.metadata;
  }

  if (subscription.collection_method) {
    createSubscriptionParams.collection_method = subscription.collection_method;
  }

  //add_invoice_items //not used (not usefull)
  //application //not used (connect)
  //application_fee_percent //not implemented (connect)
  //backdate_start_date //not implementable
  //invoice_settings //not implemented
  //off_session //not implemented
  //proration_behavior //not implemented

  if (subscription.transfer_data) {
    //createSubscriptionParams.transfer_data = subscription.transfer_data;
    //not implemented (connect)
  }

  if (subscription.days_until_due) {
    createSubscriptionParams.days_until_due = subscription.days_until_due;
  }
  if (typeof subscription.default_source === "object") {
    if (subscription.default_source) {
      createSubscriptionParams.default_source = subscription.default_source
        .id as string;
    }
  }

  if (typeof subscription.default_source === "string") {
    createSubscriptionParams.default_source = subscription.default_source;
  }

  if (subscription.pending_invoice_item_interval) {
    createSubscriptionParams.pending_invoice_item_interval =
      subscription.pending_invoice_item_interval;
  }

  if (subscription.on_behalf_of) {
    //createSubscriptionParams.on_behalf_of = subscription.on_behalf_of;
    //not implemented
  }

  if (subscription.payment_settings) {
    let payment_settings: Stripe.SubscriptionCreateParams.PaymentSettings = {
      save_default_payment_method:
        subscription.payment_settings.save_default_payment_method || undefined,
      payment_method_types:
        subscription.payment_settings.payment_method_types || undefined,
    };

    /* use default payment method */
    /*
    if (subscription.payment_settings?.payment_method_options) {
      const paymentMethodOptions =
        subscription.payment_settings.payment_method_options;
      payment_settings.payment_method_options = {};

      Object.entries(paymentMethodOptions).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Only assign if value is neither null nor undefined
          payment_settings.payment_method_options![
            key as keyof Stripe.SubscriptionCreateParams.PaymentSettings.PaymentMethodOptions
          ] = value;
        } else if (value === null) {
          // Explicitly set the value to undefined if it originally was null
          payment_settings.payment_method_options![
            key as keyof Stripe.SubscriptionCreateParams.PaymentSettings.PaymentMethodOptions
          ] = undefined;
        }
      });
    }
    */

    createSubscriptionParams.payment_settings = payment_settings;
  }

  if (subscription.default_tax_rates) {
    createSubscriptionParams.default_tax_rates =
      subscription.default_tax_rates.map((tax_rate) => tax_rate.id);
  }

  if (subscription.discount) {
    createSubscriptionParams.coupon = subscription.discount.coupon.id;
  }

  //promotion_code //not implemented

  if (subscription.billing_cycle_anchor) {
    //we dont use this because this will prorate the subscription
   // createSubscriptionParams.billing_cycle_anchor = subscription.billing_cycle_anchor;
  }

  /*
  if (subscription.billing_cycle_anchor_config?.day_of_month) {
    let billing_cycle_anchor_config: Stripe.SubscriptionCreateParams.BillingCycleAnchorConfig =
      {
        day_of_month: subscription.billing_cycle_anchor_config.day_of_month,
      };
    if (subscription.billing_cycle_anchor_config?.hour) {
      billing_cycle_anchor_config.hour =
        subscription.billing_cycle_anchor_config.hour;
    }
    if (subscription.billing_cycle_anchor_config?.minute) {
      billing_cycle_anchor_config.minute =
        subscription.billing_cycle_anchor_config.minute;
    }
    if (subscription.billing_cycle_anchor_config?.month) {
      billing_cycle_anchor_config.month =
        subscription.billing_cycle_anchor_config.month;
    }
    if (subscription.billing_cycle_anchor_config?.second) {
      billing_cycle_anchor_config.second =
        subscription.billing_cycle_anchor_config.second;
    }
    createSubscriptionParams.billing_cycle_anchor_config =
      billing_cycle_anchor_config;
  }
  */

  if (subscription.trial_end) {
    //if trial end unix is in the past dont set it
    const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current Unix timestamp
    if (Number(subscription.trial_end) > currentTimestamp) {
      // Set the trial_end only if it's in the future
      createSubscriptionParams.trial_end = subscription.trial_end;
    }
    //createSubscriptionParams.trial_end = subscription.trial_end;
  }

  if (subscription.trial_settings) {
    createSubscriptionParams.trial_settings = subscription.trial_settings;
  }

  if (subscription.cancel_at_period_end) {
    createSubscriptionParams.cancel_at_period_end = subscription.cancel_at_period_end;
  } else if (subscription.cancel_at) {
    createSubscriptionParams.cancel_at = subscription.cancel_at;
  }

  createSubscriptionParams.payment_behavior = "default_incomplete";

  //if the subscription is active, we need to set a free trial so customer 
  // is not charged directly after the migration
  if (subscription.status === "active") {
    createSubscriptionParams.trial_end = subscription.current_period_end
  }

  /**
   * As we are migrating subscriptions, I assume we didnt need:
   * - trial_from_plan
   * - trial_period_days
   */

  if (subscription.automatic_tax.enabled) {
    let automatic_tax: Stripe.SubscriptionCreateParams.AutomaticTax = {
      enabled: subscription.automatic_tax.enabled,
    };
    //automatic_tax.liability is not implemented (connect)
    createSubscriptionParams.automatic_tax = automatic_tax;
  }

  return createSubscriptionParams;
}

// Function to create a subscription on destination Stripe account
async function createSubscription(
  subscription: Stripe.Subscription
): Promise<Stripe.Response<Stripe.Subscription>> {
  if (!fs.existsSync("./mappings/prices.json")) {
    throw new Error("No prices mapping found. Please migrate prices first.");
  }
  const price_mapping = JSON.parse(
    fs.readFileSync("./mappings/prices.json", "utf-8")
  );
  const createSubscriptionParams =
    convertToSubscriptionCreateParams(subscription);
  createSubscriptionParams.items = createSubscriptionParams.items?.map(
    (item) => {
      if (item.price) {
        if (price_mapping[item.price]) {
          item.price = price_mapping[item.price];
        }
      }
      return item;
    }
  );
  return destinationStripe.subscriptions.create(createSubscriptionParams);
}

export async function getAllSubscriptionsExcept(excludedPrices: string[]) {
  //): Promise<Stripe.Subscription[]> {

  //first get all prices
  const prices = await getAllPrices();
  console.log(`Total prices: ${prices.length}`);

  //then filter out the excluded prices
  let prices_filtered = prices.filter(
    (price) => !excludedPrices.includes(price.id)
  );
  //filter out non-recurring prices (recurring = true)
  prices_filtered = prices_filtered.filter((price) => price.recurring);
  console.log(`Total prices to migrate: ${prices_filtered.length}`);

  let subscriptions: Stripe.Subscription[] = [];
  for (let price of prices_filtered) {
    //console.log(`Price: ${price.id} - ${price.nickname}`);
    let hasMore: boolean = true;
    let startingAfter: string | null = null;
    while (hasMore) {
      let request_params: ISubscriptionListRequestParams = {
        limit: PAGE_SIZE,
        price: price.id,
      };

      if (startingAfter) {
        request_params["starting_after"] = startingAfter;
      }

      const response = await sourceStripe.subscriptions.list(request_params);

      subscriptions = subscriptions.concat(response.data);
      if (SUBSCRIPTIONS_CONFIG.SHOW_PROGRESS) {
        console.log(`Fetched ${subscriptions.length} subscriptions`);
      }

      hasMore = response.has_more;
      if (response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
  }

  return subscriptions.reverse();
}
// Function to retrieve all coupons from the source Stripe account
export async function getAllSubscriptions(): Promise<Stripe.Subscription[]> {
  let subscriptions: Stripe.Subscription[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: ISubscriptionListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    const response = await sourceStripe.subscriptions.list(request_params);

    subscriptions = subscriptions.concat(response.data);
    if (SUBSCRIPTIONS_CONFIG.SHOW_PROGRESS) {
      console.log(`Fetched ${subscriptions.length} subscriptions`);
    }

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return subscriptions.reverse();
}

// Function to migrate subscriptions
async function migrateSubscriptions(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }


  console.log("Starting the migration of subscriptions...");

  let subscriptions;
  if (SUBSCRIPTIONS_CONFIG.EXCLUDED_PRICES.length > 0) {
    subscriptions = await getAllSubscriptionsExcept(
      SUBSCRIPTIONS_CONFIG.EXCLUDED_PRICES
    );
  } else {
    subscriptions = await getAllSubscriptions();
  }
  //const subscriptions = await getAllSubscriptions();
  console.log(`Total subscriptions to migrate: ${subscriptions.length}`);

  if (SUBSCRIPTIONS_CONFIG.SHOW_PROGRESS) {
    //show number of subscriptions by status
    //incomplete
    const incomplete_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "incomplete"
    );
    console.log(`Incomplete subscriptions: ${incomplete_subscriptions.length}`);
    //incomplete_expired
    const incomplete_expired_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "incomplete_expired"
    );
    console.log(
      `Incomplete expired subscriptions: ${incomplete_expired_subscriptions.length}`
    );
    //trialing
    const trialing_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "trialing"
    );
    console.log(`Trialing subscriptions: ${trialing_subscriptions.length}`);
    //active
    const active_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active"
    );
    console.log(`Active subscriptions: ${active_subscriptions.length}`);
    //past_due
    const past_due_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "past_due"
    );
    console.log(`Past due subscriptions: ${past_due_subscriptions.length}`);
    //unpaid
    const unpaid_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "unpaid"
    );
    console.log(`Unpaid subscriptions: ${unpaid_subscriptions.length}`);
    //canceled
    const canceled_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "canceled"
    );
    console.log(`Canceled subscriptions: ${canceled_subscriptions.length}`);
    //paused
    const paused_subscriptions = subscriptions.filter(
      (subscription) => subscription.status === "paused"
    );
    console.log(`Paused subscriptions: ${paused_subscriptions.length}`);
  }

  if (SUBSCRIPTIONS_CONFIG.EXPORT_JSON) {
    console.log("Exporting subscriptions to a JSON file...");
    fs.writeFileSync(
      "./output/subscriptions.json",
      JSON.stringify(subscriptions, null, 2)
    );
    const date_time_index = new Date().toISOString().replace(/:/g, "-");
    //keep a snapshot of the subscriptions (to keep a trace in case of issues)
    fs.writeFileSync(
      `./snapshots/subscriptions-${date_time_index}.json`,
      JSON.stringify(subscriptions, null, 2)
    );
    console.log("Subscriptions raw file saved in ./output/subscriptions.json");
  }

  
  for (let subscription of subscriptions) {
    try {
      //const newsubscription = await createSubscription(subscription);
      //console.log(`New subscription created: ${newsubscription.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create subscription: ${subscription.id} - reason: ${message}`
      );
    }
  }
}
export { migrateSubscriptions };
