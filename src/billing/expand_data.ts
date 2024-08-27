import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import { Stripe } from "stripe";

const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY as string;

const stripe = new Stripe(SOURCE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

async function getAllNonZeroPaymentIntents(): Promise<void> {
  try {
    let hasMore: boolean = true;
    let nextPage: string | undefined = undefined;
    const allPaymentIntents: Stripe.PaymentIntent[] = [];
    let page: number = 1;

    while (hasMore) {
      const paymentIntents: Stripe.ApiSearchResult<Stripe.PaymentIntent> = await stripe.paymentIntents.search({
        limit: 100,
        query: 'amount>0 AND status:"succeeded"',
        page: nextPage,
        expand: [
          "data.latest_charge.application_fee",
          "data.latest_charge.balance_transaction",
          "data.invoice",
          "data.invoice.customer_address",
          "data.latest_charge.balance_transaction.automatic_transfer"
        ],
      });

      allPaymentIntents.push(...paymentIntents.data);
  
      console.log(`Fetched ${paymentIntents.data.length} payment intents on page ${page}`);
  
      hasMore = paymentIntents.has_more;
      nextPage = paymentIntents.next_page !== null ? paymentIntents.next_page : undefined;
      page++;
    }

    // Save all retrieved data to a JSON file
    fs.writeFileSync("payment_intents.json", JSON.stringify(allPaymentIntents, null, 2));

    console.log("Retrieval and expansion of non-zero payment intents completed.");
  } catch (error) {
    console.error("An error occurred while retrieving payment intents:", error);
  }
}

getAllNonZeroPaymentIntents();
