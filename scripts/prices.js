require("dotenv").config();
const fs = require('fs');
const Stripe = require("stripe");

/**
 * Migration of prices from source to destination stripe account
 * require that we migrated before:
 * - Products
 */

const PAGE_SIZE = 100;

const SOURCE_STRIPE_SECRET_KEY = process.env.SOURCE_STRIPE_SECRET_KEY;
const DESTINATION_STRIPE_SECRET_KEY = process.env.DESTINATION_STRIPE_SECRET_KEY;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

async function createPrice(priceData) {
  let {
    currency,
    active,
    metadata,
    nickname,
    product,
    recurring,
    unit_amount,
    billing_scheme,
    currency_options,
    custom_unit_amount,
    lookup_key,
    product_data,
    tax_behavior,
    tiers,
    tiers_mode,
    transfer_lookup_key,
    transform_quantity,
    unit_amount_decimal
  } = priceData;

  let newPriceData = {};

  //if (id) newPriceData.id = id;
  if (currency) newPriceData.currency = currency;
  if (active) newPriceData.active = active;
  if (metadata) newPriceData.metadata = metadata;
  if (nickname) newPriceData.nickname = nickname;
  if (product) newPriceData.product = product;

  newPriceData.metadata = {
    ...newPriceData.metadata,
    source_price_id: priceData.id,
  }

  let reccuringData = {};
  if(newPriceData.interval) reccuringData.interval = newPriceData.interval;
  if(newPriceData.aggregate_usage) reccuringData.aggregate_usage = newPriceData.aggregate_usage;
  if(newPriceData.interval_count) reccuringData.interval_count = newPriceData.interval_count;
  if(newPriceData.usage_type) reccuringData.usage_type = newPriceData.usage_type;


  if (recurring) newPriceData.recurring = reccuringData;
  //if (unit_amount) newPriceData.unit_amount = unit_amount;
  if (billing_scheme) newPriceData.billing_scheme = billing_scheme;
  if (currency_options) newPriceData.currency_options = currency_options;
  if (custom_unit_amount) newPriceData.custom_unit_amount = custom_unit_amount;
  if (lookup_key) newPriceData.lookup_key = lookup_key;
  if (product_data) newPriceData.product_data = product_data;
  if (tax_behavior) newPriceData.tax_behavior = tax_behavior;
  if (tiers) newPriceData.tiers = tiers;
  if (tiers_mode) newPriceData.tiers_mode = tiers_mode;
  if (transfer_lookup_key) newPriceData.transfer_lookup_key = transfer_lookup_key;
  if (transform_quantity) newPriceData.transform_quantity = transform_quantity;
  if (unit_amount_decimal) newPriceData.unit_amount_decimal = unit_amount_decimal;

  const newPrice = await destinationStripe.prices.create(newPriceData);

  return newPrice;
}

async function getAllPrices() {
    let prices = [];
    let hasMore = true;
    let startingAfter = null;
  
    let request_params = {
      limit: PAGE_SIZE,
    }
  
    if(startingAfter) {
      request_params.starting_after = startingAfter;
    }
  
    while (hasMore) {
      const response = await sourceStripe.prices.list(request_params);
      console.log(`Found ${response.data.length} more prices.`)
      prices = prices.concat(response.data);
  
      if (response.has_more && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
  
    return prices.reverse(); // reverse the array to keep the same historical order as the source
}


async function migratePrices() {
  const prices = await getAllPrices();

  console.log(`Found ${prices.length} prices.`);
  const new_prices_mapping = {};

  for (let price of prices) {
    try {
      console.log("creating price:", price.id)
      const newPrice = await createPrice(price);
      console.log("New price created: ", newPrice.id); 
      new_prices_mapping[price.id] = newPrice.id;  
    } catch (err) {
      const { message } = err;
      console.error(`Failed to migrate price: ${price.id} - reason: ${message}`);
      continue;
    }
  }

   //save the mapping in a json file for later use ./prices.json
   fs.writeFileSync("./mappings/prices.json", JSON.stringify(new_prices_mapping));
   console.log("Prices mapping file saved in ./mappings/prices.json")
}

module.exports = { migratePrices };
