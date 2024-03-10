require('dotenv').config();
const Stripe = require("stripe");

const PAGE_SIZE = 100;

const SOURCE_STRIPE_SECRET_KEY = process.env.SOURCE_STRIPE_SECRET_KEY;
const DESTINATION_STRIPE_SECRET_KEY = process.env.DESTINATION_STRIPE_SECRET_KEY;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

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

async function getAllCoupons() {
  let coupons = [];
  let hasMore = true;
  let startingAfter = null;


  let request_params = {
    limit: PAGE_SIZE,
  }

  if(startingAfter) {
    request_params.starting_after = startingAfter;
  }

  while (hasMore) {
    const response = await sourceStripe.coupons.list(request_params);

    coupons = coupons.concat(response.data);

    if (response.has_more && response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  return coupons.reverse(); // reverse the array to keep the same historical order as the source
}

async function migrateCoupons() {
  console.log("Starting the migration of coupons...");
  const coupons = await getAllCoupons();
  console.log(`Total coupons to migrate: ${coupons.length}`);

  for (let coupon of coupons) {
    try {
      const newCoupon = await createCoupon(coupon);
      console.log(`New coupon created: ${newCoupon.id}`);
    } catch (err) {
      const { message } = err;
      console.error(`Failed to create coupon: ${coupon.id} - reason: ${message}`);
    }
  }
}

module.exports = { migrateCoupons };
