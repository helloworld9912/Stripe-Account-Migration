// Importing the migration functions
import { migrateCoupons } from "./scripts/coupons_codes";
//import { migrateProducts } from "./scripts/products";
//import { migratePrices } from "./scripts/prices";
import { CONFIG } from "./config";

// A type for the migration function
type MigrationFunction = () => Promise<void>;

// Mapping the migration configurations to their corresponding functions
const migrationTasks: Record<string, MigrationFunction> = {
  COUPONS: migrateCoupons,
  //PRODUCTS: migrateProducts,
  //PRICES: migratePrices,
};



async function startMigration(): Promise<void> {
    console.log("Starting the migration process of your Stripe data...");
  
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
  
    console.log("Migration process completed.");
  }
  
  startMigration();
  