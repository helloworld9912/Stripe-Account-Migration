import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

interface IPaymentLinksListRequestParams {
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

function convertToPaymentLinkCreateParams(
  link: Stripe.PaymentLink
): Stripe.PaymentLinkCreateParams {
  // start with an empty object

  let line_items: Stripe.PaymentLinkCreateParams.LineItem[] = [];


  let createPaymentLinkParams: Stripe.PaymentLinkCreateParams = {
    line_items: line_items,
  };

  if (link.line_items) {
    createPaymentLinkParams.line_items = link.line_items.data.map((item) => ({
      price: item.price?.id || '',
      quantity: item.quantity ?? 0,
    }));
  }

  if (link.metadata) {
    createPaymentLinkParams.metadata = link.metadata;
  }

  if (link.after_completion.type) {
    createPaymentLinkParams.after_completion = {
      type: link.after_completion.type,
    };
    if (link.after_completion.hosted_confirmation) {
      if (link.after_completion.hosted_confirmation.custom_message) {
        createPaymentLinkParams.after_completion.hosted_confirmation = {
          custom_message:
            link.after_completion.hosted_confirmation.custom_message,
        };
      }
    }
    if (link.after_completion.redirect) {
      if (link.after_completion.redirect.url) {
        createPaymentLinkParams.after_completion.redirect = {
          url: link.after_completion.redirect.url,
        };
      }
    }
  }

  if (link.allow_promotion_codes) {
    createPaymentLinkParams.allow_promotion_codes = link.allow_promotion_codes;
  }

  if (link.application_fee_amount) {
    createPaymentLinkParams.application_fee_amount =
      link.application_fee_amount;
  }

  if (link.application_fee_percent) {
    createPaymentLinkParams.application_fee_percent =
      link.application_fee_percent;
  }

  if (link.automatic_tax.enabled) {
    let automatic_tax: Stripe.SubscriptionCreateParams.AutomaticTax = {
      enabled: link.automatic_tax.enabled,
    };
    //automatic_tax.liability is not implemented (connect)
    createPaymentLinkParams.automatic_tax = automatic_tax;
  }

  if (link.billing_address_collection) {
    createPaymentLinkParams.billing_address_collection =
      link.billing_address_collection;
  }

  if (link.consent_collection) {
    let consent_collection: Stripe.PaymentLinkCreateParams.ConsentCollection =
      {};
    if (link.consent_collection.payment_method_reuse_agreement) {
      consent_collection.payment_method_reuse_agreement =
        link.consent_collection.payment_method_reuse_agreement;
    }
    if (link.consent_collection.promotions) {
      consent_collection.promotions = link.consent_collection.promotions;
    }
    if (link.consent_collection.terms_of_service) {
      consent_collection.terms_of_service =
        link.consent_collection.terms_of_service;
    }
    createPaymentLinkParams.consent_collection = consent_collection;
  }

  if (link.currency) {
    createPaymentLinkParams.currency = link.currency;
  }

  if (link.custom_fields) {
    let customFields: Stripe.PaymentLinkCreateParams.CustomField[] = [];

    for (let customField of link.custom_fields) {
      let customFieldParams: Stripe.PaymentLinkCreateParams.CustomField = {
        key: customField.key,
        type: customField.type,
        label: {
          custom: customField.label.custom ?? "", // Assuming customField.label is a string
          type: customField.label.type,
        },
      };

      if (customField.dropdown) {
        customFieldParams.dropdown = customField.dropdown;
      }
      if (customField.numeric) {
        if (customField.numeric.maximum_length) {
          customFieldParams.numeric = {
            maximum_length: customField.numeric.maximum_length,
          };
          if (customField.numeric.minimum_length) {
            customFieldParams.numeric = {
              minimum_length: customField.numeric.minimum_length,
            };
          }
        }
        if (customField.optional) {
          customFieldParams.optional = customField.optional;
        }
        if (customField.text) {
          if (customField.text.maximum_length) {
            customFieldParams.text = {
              maximum_length: customField.text.maximum_length,
            };
          }
          if (customField.text.minimum_length) {
            customFieldParams.text = {
              minimum_length: customField.text.minimum_length,
            };
          }
        }

        customFields.push(customFieldParams);
      }

      createPaymentLinkParams.custom_fields = customFields;
    }
  }

  if (link.custom_text) {
    createPaymentLinkParams.custom_text = link.custom_text;
  }

  if (link.customer_creation) {
    createPaymentLinkParams.customer_creation = link.customer_creation;
  }

  if (link.inactive_message) {
    createPaymentLinkParams.inactive_message = link.inactive_message;
  }

  if (link.invoice_creation) {
    //createPaymentLinkParams.invoice_creation = link.invoice_creation;
    if (link.invoice_creation.enabled) {
      createPaymentLinkParams.invoice_creation = {
        enabled: link.invoice_creation.enabled,
      };
      //link.invoice_creation.invoice_data is not implemented
    }
  }

  if (link.on_behalf_of) {
    //createPaymentLinkParams.on_behalf_of = link.on_behalf_of;
    //not implemented
  }

  if (link.payment_intent_data) {
    //createPaymentLinkParams.payment_intent_data = link.payment_intent_data;
    //not implemented
  }

  if (link.payment_method_collection) {
    createPaymentLinkParams.payment_method_collection =
      link.payment_method_collection;
  }

  if (link.payment_method_types) {
    createPaymentLinkParams.payment_method_types = link.payment_method_types;
  }

  if (link.phone_number_collection) {
    createPaymentLinkParams.phone_number_collection =
      link.phone_number_collection;
  }

  if (link.restrictions) {
    createPaymentLinkParams.restrictions = link.restrictions;
  }

  if (link.shipping_address_collection) {
    createPaymentLinkParams.shipping_address_collection =
      link.shipping_address_collection;
  }

  if (link.shipping_options) {
    //createPaymentLinkParams.shipping_options = link.shipping_options;
    //not implemented
  }

  if (link.submit_type) {
    createPaymentLinkParams.submit_type = link.submit_type;
  }

  if (link.subscription_data) {
    //createPaymentLinkParams.subscription_data = link.subscription_data;
    //not implemented
  }

  if (link.tax_id_collection) {
    createPaymentLinkParams.tax_id_collection = link.tax_id_collection;
  }

  if (link.transfer_data) {
    //createPaymentLinkParams.transfer_data = link.transfer_data;
    //not implemented
  }

  return createPaymentLinkParams;
}

// Function to create a coupon on destination Stripe account
async function createPaymentLink(
  link: Stripe.PaymentLink
): Promise<Stripe.Response<Stripe.PaymentLink>> {
  const createLinkParams = convertToPaymentLinkCreateParams(link);
  return destinationStripe.paymentLinks.create(createLinkParams);
}

// Function to retrieve all payment links from the source Stripe account
export async function getAllPaymentLinks(): Promise<Stripe.PaymentLink[]> {
  let links: Stripe.PaymentLink[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: IPaymentLinksListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    const response = await sourceStripe.paymentLinks.list(request_params);

    links = links.concat(response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return links.reverse();
}

// Function to migrate Payment Links
async function migratePaymentLinks(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }

  console.log("Starting the migration of Payment Links...");
  const payment_links = await getAllPaymentLinks();
  console.log(`Total Payment Links to migrate: ${payment_links.length}`);

  for (let link of payment_links) {
    try {
      const newPaymentLink = await createPaymentLink(link);
      console.log(`New payment Link created: ${newPaymentLink.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create payment link: ${link.id} - reason: ${message}`
      );
    }
  }
}
export { migratePaymentLinks };
