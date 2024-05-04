/**
 * For invoices we have 2 choices:
 * 1. Create a export file an import it inside our database
 * 2. Re-create the invoices on the destination account and mark them as paid outside of Stripe
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();
import { INVOICES_CONFIG } from "../config";
import fs from 'fs';

interface IInvoiceListRequestParams {
  limit: number;
  starting_after?: string;
  status?: "draft" | "open" | "paid" | "uncollectible" | "void";
}

// Stripe configuration and initialisation
const PAGE_SIZE = 100;
const SOURCE_STRIPE_SECRET_KEY: string = process.env
  .SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env
  .DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

// Function to create an invoice on destination Stripe account
/*
async function createInvoiceOnDestinationAccount(
  invoice: Stripe.Invoice
): Promise<Stripe.Response<Stripe.Invoice>> {
  //const createSubscriptionParams = convertToSubscriptionCreateParams(subscription);
  //return destinationStripe.subscriptions.create(createSubscriptionParams);
return
}
*/

// Function to retrieve all paid invoices from the source Stripe account
export async function getAllInvoices(): Promise<Stripe.Invoice[]> {
  let invoices: Stripe.Invoice[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: IInvoiceListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    if (INVOICES_CONFIG.ONLY_PAID_INVOICES) {
      request_params["status"] = "paid"; //only retrieve paid invoices
    }

    let response;
    if (INVOICES_CONFIG.EXCLUDE_0_AMOUNT_INVOICES) {
      const response_data = await sourceStripe.invoices.search({
        query: `status:"paid" AND total>0`,
        limit: request_params.limit,
        page: request_params.starting_after,
      });
      response = response_data;
    } else {
      const response_data = await sourceStripe.invoices.list(request_params);
      response = response_data;
    }

    invoices = invoices.concat(response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
    if (hasMore && (response as any).next_page) {
      startingAfter = (response as any).next_page;
    }
  }

  return invoices.reverse();
}

// Function to migrate subscriptions
async function migrateInvoices(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }

  console.log("Starting the migration of invoices...");
  const invoices = await getAllInvoices();
  console.log(`Total invoices to migrate: ${invoices.length}`);

  if(INVOICES_CONFIG.EXPORT_JSON){
    console.log("Exporting invoices to a JSON file...");
    fs.writeFileSync("./output/invoices.json", JSON.stringify(invoices, null, 2));
    console.log("Invoices raw file saved in ./output/invoices.json");
  }

  for (let invoice of invoices) {
    try {
      //const newInvoice = await createInvoice(invoice);
      //console.log(`New invoice created: ${newInvoice.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create invoice: ${invoice.id} - reason: ${message}`
      );
    }
  }
}
export { migrateInvoices };
