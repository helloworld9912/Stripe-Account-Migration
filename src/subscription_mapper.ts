import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import csv from "csv-parser";
import { Stripe } from "stripe";

const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);

function loadSourceMapping(filePath: string): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    const sourceMapping = new Map<string, string>();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        sourceMapping.set(row.source_id_old, row.source_id_new);
      })
      .on("end", () => {
        resolve(sourceMapping);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function start() {
  const subscriptions = JSON.parse(fs.readFileSync("output/subscriptions.json", "utf8"));
  const sourceMapping: Map<string, string> = await loadSourceMapping("input/sources_mapping.csv");

  let successCount = 0;
  const failedList: { customerId: string; paymentMethod: string, type:string }[] = [];

  for (const subscription of subscriptions) {
    if (subscription.default_payment_method) {
      const newSourceId = sourceMapping.get(subscription.default_payment_method);
      if (newSourceId) {
        subscription.default_payment_method = newSourceId;
        successCount++;
      } else {

        //get the payment method type who failed
        const response = await sourceStripe.paymentMethods.retrieve(subscription.default_payment_method);
        failedList.push({
          customerId: subscription.customer,
          paymentMethod: subscription.default_payment_method,
          type: response.type
        });
      }
    }
  }

  fs.writeFileSync("output/updated_subscriptions.json", JSON.stringify(subscriptions, null, 2));
  //potential failed list
  fs.writeFileSync("output/failed_list.json", JSON.stringify(failedList, null, 2));

  console.log(`Success count: ${successCount}`);
  console.log(`Failed count: ${failedList.length}`);
}


start().catch((error) => {
  console.error("An error occurred:", error);
});
