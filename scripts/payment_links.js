require('dotenv').config();
const Stripe = require("stripe");

/**
 * Migration of directs payments links from source to destination stripe account
 * require that we migrated before:
 * - Products
 * - Prices
 * - Plans
 * - Coupons
 */

const PAGE_SIZE = 100;

const SOURCE_STRIPE_SECRET_KEY = process.env.SOURCE_STRIPE_SECRET_KEY;
const DESTINATION_STRIPE_SECRET_KEY = process.env.DESTINATION_STRIPE_SECRET_KEY;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);




/* NOT FINISHED NEED TO UPDATE BELLOW */

async function createCoupon(couponData) {

  let {
    id,
    name,
    percent_off,
    duration,
    duration_in_months,
    currency,
    amount_off,
    max_redemptions,
  } = couponData;

  let newCouponData = {};
  if (id) newCouponData.id = id;
  if (name) newCouponData.name = name;
  if (percent_off) newCouponData.percent_off = percent_off;
  if (duration) newCouponData.duration = duration;
  if (duration_in_months) newCouponData.duration_in_months = duration_in_months;
  if (currency) newCouponData.currency = currency;
  if (amount_off) newCouponData.amount_off = amount_off;
  if (max_redemptions) newCouponData.max_redemptions = max_redemptions;

  const newCoupon = await destinationStripe.coupons.create(newCouponData);
  return newCoupon;
}

async function getAllPaymentLinks() {
  let links = [];
  let hasMore = true;
  let startingAfter = null;

  let request_params = {
    limit: PAGE_SIZE,
  }

  if(startingAfter) {
    request_params.starting_after = startingAfter;
  }

  while (hasMore) {
    const response = await sourceStripe.paymentLinks.list(request_params);
    console.log(`Found ${response.data.length} payment links.`)
    links = links.concat(response.data);

    if (response.has_more && response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  return links.reverse(); // reverse the array to keep the same historical order as the source
}

async function migratePaymentLinks() {

  console.log("Starting the migration of payment links...");
  const payment_links = await getAllPaymentLinks();
  console.log(`Total payment links to migrate: ${payment_links.length}`);

    for (let link of links) {
      try {
        const newPaymentLink = await createPaymentLink(link);
        console.log("New payment link created: ", newPaymentLink.id);
      } catch (err) {
        const { message } = err;
        console.error(`Failed to create payment link: ${link.id} - reason: ${message}`);
        continue;
      }
    }

}

  module.exports = { migratePaymentLinks };
