// Importing the migration functions
import { getAllCoupons } from "./scripts/coupons_codes";
import { getAllPaymentLinks } from "./scripts/payment_links";
import { getAllPrices } from "./scripts/prices";
import { getAllProducts } from "./scripts/products";
import { getAllPromotionCodes } from "./scripts/promotion_codes";
import { getAllScriptionSchedules } from "./scripts/subscription_schedules";
import { getAllSubscriptions } from "./scripts/subscriptions";

async function startMigration(): Promise<void> {
  try {
    console.log(
      "Starting the inventory process of your Stripe data [SOURCE ACCOUNT]..."
    );
    const coupons = await getAllCoupons();
    console.log(`Total coupons to migrate: ${coupons.length}`);
    const paymentLinks = await getAllPaymentLinks();
    console.log(`Total payment links to migrate: ${paymentLinks.length}`);
    const prices = await getAllPrices();
    console.log(`Total prices to migrate: ${prices.length}`);
    const products = await getAllProducts();
    console.log(`Total products to migrate: ${products.length}`);
    const promotionCodes = await getAllPromotionCodes();
    console.log(`Total promotion codes to migrate: ${promotionCodes.length}`);
    const subscriptionSchedules = await getAllScriptionSchedules();
    console.log(
      `Total subscription schedules to migrate: ${subscriptionSchedules.length}`
    );
    const subscriptions = await getAllSubscriptions();
    console.log(`Total subscriptions to migrate: ${subscriptions.length}`);
    

    console.log("Inventory process completed.");
  } catch (err) {
    console.error("Inventory process failed!");
    console.error(err);
  }
}

startMigration();
