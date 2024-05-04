// Importing the migration functions
import { migrateCoupons } from "./scripts/coupons_codes";
//import { migrateProducts } from "./scripts/products";
//import { migratePrices } from "./scripts/prices";
import { CONFIG } from "./config";
import { migratePromotionCode } from "./scripts/promotion_codes";
import { migrateScriptionSchedules } from "./scripts/subscription_schedules";
import { migrateInvoices } from "./scripts/invoices";

// A type for the migration function
type MigrationFunction = () => Promise<void>;

// Mapping the migration configurations to their corresponding functions
const migrationTasks: Record<string, MigrationFunction> = {
  //COUPONS: migrateCoupons, //need : ['products']
  //PROMOTION_CODES: migratePromotionCode, //need : ['coupons', 'customer']
  //PRODUCTS: migrateProducts, // need nothing
  //PRICES: migratePrices, //need : ['products']
  //SUBSCRIPTIONS: migrateSubscriptions, //need : ['products', 'prices', 'customer']
  //SUBSCRIPTION_SCHEDULES: migrateScriptionSchedules, //need : ['products', 'prices', 'customer']
};



async function startMigration(): Promise<void> {
    console.log("Starting the migration process of your Stripe data...");
    //await migrateCoupons();
    //await migrateScriptionSchedules();
    await migrateInvoices();
    /*
    for (const [key, isEnabled] of Object.entries(CONFIG.MIGRATE)) {
      if (isEnabled) {
        console.log(`Starting the migration of ${key.toLowerCase()}...`);
        try {
          await migrationTasks[key](); // Execute the corresponding migration function
          console.log(`Migration of ${key.toLowerCase()} completed with success.`);
        } catch (err) {
          console.error(`Migration of ${key.toLowerCase()} failed!`);
          console.error(err);
        }
      }
    }
    */
  
    console.log("Migration process completed.");
  }
  
  startMigration();
  