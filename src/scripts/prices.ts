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

interface PriceData extends Partial<Stripe.PriceCreateParams> {
  id: string;
}

function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc: Record<string, unknown>, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {}) as Partial<T>;
  }
  

  async function createPrice(priceData: Stripe.Price): Promise<Stripe.Response<Stripe.Price>> {
    let newPriceData: Stripe.PriceCreateParams = {
        ...priceData
    }

    const newPrice = await destinationStripe.prices.create(newPriceData);
    return newPrice;
  }

 
async function createPrice2(priceData: Stripe.Price): Promise<Stripe.Response<Stripe.Price>> {
  let newPriceData: Stripe.PriceCreateParams = cleanObject({
    currency: priceData.currency,
    active: priceData.active,
    nickname: priceData.nickname,
    product: priceData.product,
    recurring: priceData.recurring && cleanObject({
      interval: priceData.recurring.interval,
      aggregate_usage: priceData.recurring.aggregate_usage,
      interval_count: priceData.recurring.interval_count,
      usage_type: priceData.recurring.usage_type,
    }),
    billing_scheme: priceData.billing_scheme,
    currency_options: priceData.currency_options,
    custom_unit_amount: priceData.custom_unit_amount,
    tax_behavior: priceData.tax_behavior,
    tiers: priceData.tiers,
    tiers_mode: priceData.tiers_mode,
    transform_quantity: priceData.transform_quantity,
    unit_amount_decimal: priceData.unit_amount_decimal,
    metadata: {
      ...priceData.metadata,
      source_price_id: priceData.id,
    }
  }) as Stripe.PriceCreateParams; // Cast is safe after cleaning

  // Create the price using the Stripe API
  const newPrice = await destinationStripe.prices.create(newPriceData);
  
  return newPrice;
}


async function createPrice1(priceData: Stripe.Price): Promise<Stripe.Price> {

     // Start with mandatory fields
  let newPriceData: Stripe.PriceCreateParams = {
    currency: priceData.currency, //required
    product: priceData.product as string, //required
    metadata: {
      ...(priceData.metadata && { ...priceData.metadata }),
      source_price_id: priceData.id,
    }
  };

  // Conditionally add optional fields if they exist
  if (priceData.active) newPriceData.active = priceData.active;
  if (priceData.nickname) newPriceData.nickname = priceData.nickname;
  if (priceData.product) newPriceData.product = priceData.product as string;

  // Handle the recurring object more carefully
  if (priceData.recurring) {
    newPriceData.recurring = {
        interval: priceData.recurring.interval, //required
    };
    if (priceData.recurring.aggregate_usage) newPriceData.recurring.aggregate_usage = priceData.recurring.aggregate_usage;
    if (priceData.recurring.interval_count) newPriceData.recurring.interval_count = priceData.recurring.interval_count;
    if (priceData.recurring.usage_type) newPriceData.recurring.usage_type = priceData.recurring.usage_type;
    if (priceData.unit_amount) newPriceData.unit_amount = priceData.unit_amount;
  }

  //billing_scheme | enum
  //currency_options | object


  /*
  let newPriceData: Stripe.PriceCreateParams = {
    ...id && { currency },
    ...active !== undefined && { active },
    ...(nickname && { nickname }),
    ...(product && { product }),
    ...recurring && { recurring: {
      ...recurring.interval && { interval: recurring.interval },
      ...recurring.aggregate_usage && { aggregate_usage: recurring.aggregate_usage },
      ...recurring.interval_count && { interval_count: recurring.interval_count },
      ...recurring.usage_type && { usage_type: recurring.usage_type },
    }},
    ...(billing_scheme && { billing_scheme }),
    ...(currency_options && { currency_options }),
    ...(custom_unit_amount && { custom_unit_amount }),
    ...(lookup_key && { lookup_key }),
    ...(tax_behavior && { tax_behavior }),
    ...(tiers && { tiers }),
    ...(tiers_mode && { tiers_mode }),
    ...(transform_quantity && { transform_quantity }),
    ...(unit_amount_decimal && { unit_amount_decimal }),
    metadata: {
      ...metadata,
      source_price_id: id,
    }
  };
  */

  const newPrice: Stripe.Price = await destinationStripe.prices.create(newPriceData);
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
