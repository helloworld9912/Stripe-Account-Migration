import dotenv from 'dotenv';
import fs from 'fs';

import { Stripe } from 'stripe';

dotenv.config();

const PAGE_SIZE = 100;

if(!process.env.SOURCE_STRIPE_SECRET_KEY || !process.env.DESTINATION_STRIPE_SECRET_KEY) {
    console.error("Please set SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY in .env file");
    process.exit(1);
}

const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY!;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env.DESTINATION_STRIPE_SECRET_KEY!;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

function convertToPriceCreateParams(price: Stripe.Price): Stripe.PriceCreateParams {

  //if billing_scheme is set to tiered, return (not implemented yet)
  if(price.billing_scheme === 'tiered') {
    console.error("Tiered billing_scheme is not supported yet");
    return {} as Stripe.PriceCreateParams;
  }

  // Start with the required properties
  let priceCreateParams: Stripe.PriceCreateParams = {
    currency: price.currency,
    product: price.product as string,
  };

  // Add conditional properties if they exist on the provided price object
  if (price.nickname) {
    priceCreateParams.nickname = price.nickname;
  }
  
  if ('active' in price) {
    priceCreateParams.active = price.active;
  }
  
  if (price.metadata) {
    priceCreateParams.metadata = price.metadata;
  }

  if (price.recurring) {
    priceCreateParams.recurring = {
      interval: price.recurring.interval
    };

    if (price.recurring.aggregate_usage) {
      priceCreateParams.recurring.aggregate_usage = price.recurring.aggregate_usage;
    }
    
    if (price.recurring.interval_count) {
      priceCreateParams.recurring.interval_count = price.recurring.interval_count;
    }
    
    if (price.recurring.usage_type) {
      priceCreateParams.recurring.usage_type = price.recurring.usage_type;
    }
  }

  if (price.unit_amount) {
    priceCreateParams.unit_amount = price.unit_amount;
  }
  
  if (price.billing_scheme) {
    priceCreateParams.billing_scheme = price.billing_scheme;
  }
  
  if (price.custom_unit_amount) {
    priceCreateParams.custom_unit_amount = {
      enabled: true,
      maximum: price.custom_unit_amount.maximum as number,
      minimum: price.custom_unit_amount.minimum as number,
      preset: price.custom_unit_amount.preset as number,
    };
  }
  
  if (price.lookup_key) {
    priceCreateParams.lookup_key = price.lookup_key;
  }
  
  //price.product_data is ignored as we only need the product ID
  
  if (price.tax_behavior) {
    priceCreateParams.tax_behavior = price.tax_behavior;
  }
  
  if (price.tiers_mode) {
    priceCreateParams.tiers_mode = price.tiers_mode;
  }
  
  if (price.transform_quantity) {
    priceCreateParams.transform_quantity = {
      divide_by: price.transform_quantity.divide_by,
      round: price.transform_quantity.round,
    };
  }
  
  if (price.unit_amount_decimal) {
    priceCreateParams.unit_amount_decimal = price.unit_amount_decimal;
  }
  
  // The actual Price object may contain other properties for currency_options and tiers
  if (price.currency_options) {
    priceCreateParams.currency_options = {};

    for (const [currencyCode, currencyOption] of Object.entries(price.currency_options)) {
        let currencyOptionParams: Stripe.PriceCreateParams.CurrencyOptions = {};

        if (currencyOption.unit_amount) {
          currencyOptionParams.unit_amount = currencyOption.unit_amount;
        }
        
        priceCreateParams.currency_options[currencyCode] = currencyOptionParams;
    }
  }

  return priceCreateParams;
}



  async function createPrice(priceData: Stripe.Price): Promise<Stripe.Response<Stripe.Price>> {
    const newPriceData = convertToPriceCreateParams(priceData);
    const newPrice = await destinationStripe.prices.create(newPriceData);
    return newPrice;
  }

 

async function getAllPrices(): Promise<Stripe.Price[]> {
    let prices: Stripe.Price[] = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {

      let request_params: Stripe.PriceListParams = {
        limit: PAGE_SIZE,
      };

      if (startingAfter) {
        request_params['starting_after'] = startingAfter;
      }

      const response: Stripe.ApiList<Stripe.Price> = await sourceStripe.prices.list(request_params);
      console.log(`Found ${response.data.length} more prices.`);
      prices = prices.concat(response.data);
  
      hasMore = response.has_more;
      if (response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
  
    return prices.reverse(); // Keep historical order
}

async function migratePrices(): Promise<void> {
  const prices = await getAllPrices();
  console.log(`Found ${prices.length} prices.`);
  const new_prices_mapping: Record<string, string> = {};

  for (let price of prices) {
    try {
      console.log("Creating price:", price.id);
      const newPrice = await createPrice(price);
      console.log("New price created: ", newPrice.id); 
      new_prices_mapping[price.id] = newPrice.id;  
    } catch (err) {
      console.error(`Failed to migrate price: ${price.id} - reason: ${err instanceof Error ? err.message : "Unknown error"}`);
      continue;
    }
  }

  // Save the mapping in a JSON file for later use ./prices.json
  fs.writeFileSync("./mappings/prices.json", JSON.stringify(new_prices_mapping, null, 2));
  console.log("Prices mapping file saved in ./mappings/prices.json");
}

export { migratePrices };
