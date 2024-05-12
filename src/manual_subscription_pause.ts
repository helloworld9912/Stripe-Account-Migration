import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import { Stripe } from "stripe";

const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env.DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

function logFailedMigration(subscriptionId: string, errorMessage: string) {
  const logMessage = `Failed to migrate subscription: ${subscriptionId} - reason: ${errorMessage}\n`;
  fs.appendFileSync("failed_migrations.log", logMessage);
}

async function start() {
  const subscriptions = JSON.parse(fs.readFileSync("output/subscriptions.json", "utf8"));

  console.log(`Total number of subscriptions : ${subscriptions.length}`)
  
  const start_from_index = 1;
  const end_at_index = 700;


  for (let i = start_from_index; i < end_at_index && i < subscriptions.length; i++) {
    const subscription = subscriptions[i];

    try{

      await sourceStripe.subscriptions.update(subscription.id, {
        pause_collection: {
          behavior: 'mark_uncollectible'
        }
      });

      console.log(`Successfully paused subscription: ${subscription.id}`);
 

    }catch (err){
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to pause subscription: ${subscription.id} - reason: ${message}`
      );
      logFailedMigration(subscription.id, message); // Log the failed migration
    }

  }
}

start().catch((error) => {
  console.error("An error occurred:", error);
});
