import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

interface IPromotionCodeListRequestParams {
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

function convertToPromotionCodeCreateParams(
  promotion_code: Stripe.PromotionCode
): Stripe.PromotionCodeCreateParams {
  // start with an empty object
  let promotionCodeCreateParams: Stripe.PromotionCodeCreateParams = {
    coupon: promotion_code.coupon.id,
  };

  if (promotion_code.code) {
    promotionCodeCreateParams.code = promotion_code.code;
  }

  if (promotion_code.metadata) {
    promotionCodeCreateParams.metadata = promotion_code.metadata;
  }

  if (promotion_code.active) promotionCodeCreateParams.active = promotion_code.active;

  if(typeof promotion_code.customer === 'string'){
    promotionCodeCreateParams.customer = promotion_code.customer;
  }

  if(promotion_code.expires_at){
    promotionCodeCreateParams.expires_at = promotion_code.expires_at;
  }

  if(promotion_code.max_redemptions){
    promotionCodeCreateParams.max_redemptions = promotion_code.max_redemptions;
  }

  if(promotion_code.restrictions){
    promotionCodeCreateParams.restrictions = {
        currency_options: promotion_code.restrictions.currency_options,
        first_time_transaction: promotion_code.restrictions.first_time_transaction,
    }

    if(promotion_code.restrictions.minimum_amount && promotion_code.restrictions.minimum_amount_currency){
        promotionCodeCreateParams.restrictions.minimum_amount = promotion_code.restrictions.minimum_amount;
        promotionCodeCreateParams.restrictions.minimum_amount_currency = promotion_code.restrictions.minimum_amount_currency;
    }
  }

  return promotionCodeCreateParams;
}

// Function to create a coupon on destination Stripe account
async function createPromotionCode(
  promotion_code: Stripe.PromotionCode
): Promise<Stripe.Response<Stripe.PromotionCode>> {
  const createPromoCodeParams = convertToPromotionCodeCreateParams(promotion_code);
  return destinationStripe.promotionCodes.create(createPromoCodeParams);
}

// Function to retrieve all promotion codes from the source Stripe account
async function getAllPromotionCodes(): Promise<Stripe.PromotionCode[]> {
  let promotion_codes: Stripe.PromotionCode[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: IPromotionCodeListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    const response = await sourceStripe.promotionCodes.list(request_params);

    promotion_codes = promotion_codes.concat(response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return promotion_codes.reverse();
}

// Function to migrate promotion codes
async function migratePromotionCode(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }

  console.log("Starting the migration of promotion codes...");
  const promotion_codes = await getAllPromotionCodes();
  console.log(`Total promotion codes to migrate: ${promotion_codes.length}`);

  for (let promo_code of promotion_codes) {
    try {
      const newPromoCode = await createPromotionCode(promo_code);
      console.log(`New Promo Code created: ${newPromoCode.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create promotion code: ${promo_code.id} - reason: ${message}`
      );
    }
  }
}
export { migratePromotionCode };
