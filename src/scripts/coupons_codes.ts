import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

// Define an interface for the coupon data
interface ICouponData {
  id?: string;
  name?: string;
  percent_off?: number;
  duration: 'forever' | 'once' | 'repeating';
  duration_in_months?: number;
  currency?: string;
  amount_off?: number;
  max_redemptions?: number;
}

interface ICouponListRequestParams {
  limit: number;
  starting_after?: string;
}

// Stripe configuration and initialisation
const PAGE_SIZE = 100;
const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env.DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

// Function to create a coupon on destination Stripe account
async function createCoupon(couponData: ICouponData): Promise<Stripe.Response<Stripe.Coupon>> {
  return destinationStripe.coupons.create(couponData);
}

// Function to retrieve all coupons from the source Stripe account
async function getAllCoupons(): Promise<Stripe.Coupon[]> {
  let coupons: Stripe.Coupon[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {

    let request_params: ICouponListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params['starting_after'] = startingAfter;
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
  console.log("Starting the migration of coupons...");
  const coupons = await getAllCoupons();
  console.log(`Total coupons to migrate: ${coupons.length}`);

  for (let coupon of coupons) {
    try {
      const newCoupon = await createCoupon(coupon as ICouponData);
      console.log(`New coupon created: ${newCoupon.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Failed to create coupon: ${coupon.id} - reason: ${message}`);
    }
  }
}
export { migrateCoupons };
