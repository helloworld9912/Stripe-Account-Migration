//a script to import invoices data to mongo db to be reused later
import fs from "fs";
import dbConnect from "./utils/dbConnect";
import StripeInvoices from "./models/StripeInvoices";

// mongodb insert limit is 100.000 documents,
// throw an error if number of invoice to import is more than 100.000

async function startImport() {
  try {
    const invoices = JSON.parse(
      fs.readFileSync("output/invoices.json", "utf-8")
    );
    if (invoices.length > 100000) {
      throw new Error("Number of invoices to import is more than 100.000");
    }

    // import the invoices data to mongo db
    // the code below is just a placeholder, replace it with the actual import code
    console.log("Importing invoices data to mongo db...");
    console.log("Number of invoices to import: ", invoices.length);

    await dbConnect();

    //insert many
    await StripeInvoices.insertMany(invoices);

    console.log("Importing invoices data to mongo db done!");
    return;
  } catch (error) {
    console.log("Error during the import process: ", error);
  }
}

startImport();
