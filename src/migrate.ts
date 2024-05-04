import { CONFIG } from "./config";

import { migrateCoupons } from "./scripts/coupons_codes";
import { migrateProducts } from "./scripts/products";
import { migratePrices } from "./scripts/prices";
import { migratePromotionCode } from "./scripts/promotion_codes";
import { migrateScriptionSchedules } from "./scripts/subscription_schedules";
import { migrateInvoices } from "./scripts/invoices";
import { migrateSubscriptions } from "./scripts/subscriptions";
import { migratePaymentLinks } from "./scripts/payment_links";

/**
 * The migration process need to follow a specific order to avoid any issues.
 * For example, you can't migrate subscriptions before migrating products and prices.
 * This is why we need to define the migration tasks in a specific order.
 * 1. PRODUCTS
 * 2. PRICES
 * 3. COUPONS
 * 4. PROMOTION_CODES
 * 5. PAYMENT_LINKS
 * 6. SUBSCRIPTIONS
 * 7. SUBSCRIPTION_SCHEDULES
 * 8. INVOICES
 */

async function startMigration(): Promise<void> {
    console.log("Starting the migration process of your Stripe data...");

    if(CONFIG.MIGRATE.PRODUCTS) {
      await migrateProducts();
    }

    if(CONFIG.MIGRATE.PRICES) {
      await migratePrices();
    }

    if(CONFIG.MIGRATE.COUPONS) {
      await migrateCoupons();
    }

    if(CONFIG.MIGRATE.PROMOTION_CODES) {
      await migratePromotionCode();
    }

    if(CONFIG.MIGRATE.PAYMENT_LINKS) {
      await migratePaymentLinks();
    }

    if(CONFIG.MIGRATE.SUBSCRIPTIONS) {
      await migrateSubscriptions();
    }

    if(CONFIG.MIGRATE.SUBSCRIPTION_SCHEDULES) {
      await migrateScriptionSchedules();
    }

    if(CONFIG.MIGRATE.INVOICES) {
      await migrateInvoices();
    }
  
    console.log("Migration process completed.");
  }
  
  startMigration();
  