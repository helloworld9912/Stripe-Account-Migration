import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

interface ICouponListRequestParams {
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

function convertToCouponCreateParams(
  coupon: Stripe.Coupon
): Stripe.CouponCreateParams {
  // start with an empty object
  let couponCreateParams: Stripe.CouponCreateParams = {};

  if (coupon.id) {
    couponCreateParams.id = coupon.id;
  }

  // manually assign each compatible property from Coupon to CouponCreateParams
  if (coupon.amount_off !== null) {
    couponCreateParams.amount_off = coupon.amount_off;
    // currency is required if amount_off is set
    couponCreateParams.currency = coupon.currency || undefined;
  }

  // percent_off is not allowed if amount_off is set, and vice versa
  if (coupon.percent_off !== null && coupon.amount_off === null) {
    couponCreateParams.percent_off = coupon.percent_off;
  }

  couponCreateParams.duration = coupon.duration;
  if (coupon.duration === "repeating") {
    couponCreateParams.duration_in_months =
      coupon.duration_in_months || undefined;
  }

  // Optional properties can be set as needed based on the Coupon object
  couponCreateParams.max_redemptions = coupon.max_redemptions || undefined;
  couponCreateParams.redeem_by = coupon.redeem_by || undefined;
  couponCreateParams.name = coupon.name || undefined;

  // If metadata exists and is not null, convert all values to strings
  if (coupon.metadata !== null) {
    couponCreateParams.metadata = {};
    for (const [key, value] of Object.entries(coupon.metadata)) {
      if (value !== null) {
        couponCreateParams.metadata[key] = String(value);
      }
    }
  }

  // Handle 'applies_to' field
  if (coupon.applies_to?.products) {
    couponCreateParams.applies_to = {
      products: coupon.applies_to.products,
    };
  }

  // Handle 'currency_options' field
  if (coupon.currency_options) {
    couponCreateParams.currency_options = {};

    for (const [currency, options] of Object.entries(coupon.currency_options)) {
      if (options.amount_off !== null) {
        // Assuming this is a required property based on your additional context
        couponCreateParams.currency_options[currency] = {
          amount_off: options.amount_off,
        };
      }
    }
  }

  return couponCreateParams;
}

// Function to create a coupon on destination Stripe account
async function createCoupon(
  coupon: Stripe.Coupon
): Promise<Stripe.Response<Stripe.Coupon>> {
  const couponParams = convertToCouponCreateParams(coupon);
  return destinationStripe.coupons.create(couponParams);
}

// Function to retrieve all coupons from the source Stripe account
export async function getAllCoupons(): Promise<Stripe.Coupon[]> {
  let coupons: Stripe.Coupon[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: ICouponListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    const response = await sourceStripe.coupons.list(request_params);

    coupons = coupons.concat(response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return coupons.reverse();
}

// Function to migrate coupons
async function migrateCoupons(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }

  console.log("Starting the migration of coupons...");
  const coupons = await getAllCoupons();
  console.log(`Total coupons to migrate: ${coupons.length}`);

  for (let coupon of coupons) {
    try {
      const newCoupon = await createCoupon(coupon);
      console.log(`New coupon created: ${newCoupon.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create coupon: ${coupon.id} - reason: ${message}`
      );
    }
  }
}
export { migrateCoupons };
