import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import { Stripe } from "stripe";

const SOURCE_STRIPE_SECRET_KEY: string = process.env.SOURCE_STRIPE_SECRET_KEY as string;

const stripe = new Stripe(SOURCE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

const extractInvoicesWithPositiveTotal = async () => {
  try {
    let hasMore = true;
    let nextPage: string | null = null;
    const invoicesWithPositiveTotal: Stripe.Invoice[] = [];
    let page = 1;

    while (hasMore) {

    const cursor = nextPage ? { page: nextPage } : {};

      const invoices = await stripe.invoices.search({
        limit: 100,
        query: 'total>0 AND status:\'paid\'',
        ...cursor
      });

      invoicesWithPositiveTotal.push(...invoices.data);

      console.log(`Fetched ${invoices.data.length} invoices with positive total on page ${page}`);

      hasMore = invoices.has_more;
      nextPage = invoices.next_page;
      page++;
    }

    // Save data inside a JSON file for further processing
    fs.writeFileSync("invoices_with_positive_total.json", JSON.stringify(invoicesWithPositiveTotal, null, 2));

    console.log("Extraction of invoices with positive total completed.");
  } catch (error) {
    console.error("An error occurred while extracting invoices with positive total:", error);
  }
};

extractInvoicesWithPositiveTotal().catch(error => {
  console.error("An error occurred:", error);
});
