import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import { Stripe } from "stripe";

const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY as string;

const stripe = new Stripe(SOURCE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

const logFailedUnpause = (subscriptionId: string, errorMessage: string) => {
  const logMessage = `Failed to unpause subscription: ${subscriptionId} - reason: ${errorMessage}\n`;
  fs.appendFileSync("failed_unpauses.log", logMessage);
};

const unpauseAllSubscriptions = async () => {
  try {
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const subscriptions: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const subscription of subscriptions.data) {
        try {
          await stripe.subscriptions.update(subscription.id, {
            pause_collection: null // Unpause the subscription by setting pause_collection to null
          });
          console.log(`Successfully unpaused subscription: ${subscription.id}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error(`Failed to unpause subscription: ${subscription.id} - reason: ${message}`);
          logFailedUnpause(subscription.id, message); // Log the failed unpause
        }
      }

      hasMore = subscriptions.has_more;
      if (hasMore) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }
    }

  } catch (error) {
    console.error("An error occurred while listing subscriptions:", error);
  }
};

unpauseAllSubscriptions().catch(error => {
  console.error("An error occurred:", error);
});
