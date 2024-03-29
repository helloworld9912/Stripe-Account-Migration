import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

interface ISubscriptionListRequestParams {
  limit: number;
  starting_after?: string;
}

// Stripe configuration and initialisation
const PAGE_SIZE = 100;
const SOURCE_STRIPE_SECRET_KEY: string = process.env
  .SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env
  .DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

function convertToSubscriptionCreateParams(
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

  if (subscription.cancel_at_period_end) {
    createSubscriptionParams.cancel_at_period_end =
      subscription.cancel_at_period_end;
  }

  if (subscription.currency) {
    createSubscriptionParams.currency = subscription.currency;
  }

  if (typeof subscription.default_payment_method === "object") {
    createSubscriptionParams.default_payment_method =
      subscription.default_payment_method?.id;
  }
  if (typeof subscription.default_payment_method === "string") {
    createSubscriptionParams.default_payment_method =
      subscription.default_payment_method;
  }

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
    createSubscriptionParams.billing_cycle_anchor =
      subscription.billing_cycle_anchor;
  }

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

  if (subscription.trial_end) {
    createSubscriptionParams.trial_end = subscription.trial_end;
  }

  if (subscription.trial_settings) {
    createSubscriptionParams.trial_settings = subscription.trial_settings;
  }

  if (subscription.cancel_at) {
    createSubscriptionParams.cancel_at = subscription.cancel_at;
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
  const createSubscriptionParams =
    convertToSubscriptionCreateParams(subscription);
  return destinationStripe.subscriptions.create(createSubscriptionParams);
}

// Function to retrieve all coupons from the source Stripe account
async function getAllSubscriptions(): Promise<Stripe.Subscription[]> {
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
  const subscriptions = await getAllSubscriptions();
  console.log(`Total subscriptions to migrate: ${subscriptions.length}`);

  for (let subscription of subscriptions) {
    try {
      const newsubscription = await createSubscription(subscription);
      console.log(`New subscription created: ${newsubscription.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create subscription: ${subscription.id} - reason: ${message}`
      );
    }
  }
}
export { migrateSubscriptions };
