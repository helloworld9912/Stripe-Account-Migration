import fs from "fs";

interface Address {
  country?: string;
}

interface Invoice {
  customer: string;
  amount_due: number;
  customer_address: Address | null;
  amount_paid: number;
  tax?: number;
  currency: string;
}

const readInvoicesData = () => {
  try {
    const invoicesData = fs.readFileSync("all_invoices.json", "utf-8");
    const invoices: Invoice[] = JSON.parse(invoicesData);

    // Number of invoices
    const numberOfInvoices = invoices.length;
    console.log(`Number of invoices: ${numberOfInvoices}`);

    // Number of different clients
    const uniqueCustomers = new Set(invoices.map(invoice => invoice.customer));
    const numberOfCustomers = uniqueCustomers.size;
    console.log(`Number of different clients: ${numberOfCustomers}`);

    // Total amount collected
    const totalAmountCollected = invoices.reduce((total, invoice) => total + invoice.amount_due, 0);
    console.log(`Total amount collected: ${totalAmountCollected}`);

    // Array of all different countries
    const countries = invoices.map(invoice => invoice.customer_address?.country).filter(Boolean) as string[];
    const uniqueCountries = [...new Set(countries)];
    console.log(`Array of all different countries: ${JSON.stringify(uniqueCountries)}`);

    // Number of transactions for each country
    const countryTransactionCounts: { [country: string]: number } = countries.reduce((counts: { [country: string]: number }, country) => {
      counts[country] = (counts[country] || 0) + 1;
      return counts;
    }, {});
    console.log(`Number of transactions for each country: ${JSON.stringify(countryTransactionCounts)}`);

    // Array of all different currencies
    const currencies = invoices.map(invoice => invoice.currency);
    const uniqueCurrencies = [...new Set(currencies)];
    console.log(`Array of all different currencies: ${JSON.stringify(uniqueCurrencies)}`);

    // Total amount paid for each currency
    const totalAmountPaidByCurrency: { [currency: string]: number } = invoices.reduce((amounts: { [currency: string]: number }, invoice) => {
      const { currency, amount_paid } = invoice;
      amounts[currency] = (amounts[currency] || 0) + amount_paid;
      return amounts;
    }, {});
    console.log(`Total amount paid for each currency: ${JSON.stringify(totalAmountPaidByCurrency)}`);
    console.log(`Number of different currencies: ${Object.keys(totalAmountPaidByCurrency).length}`);

    // Total amount of tax
    const totalTax = invoices.reduce((total, invoice) => total + (invoice.tax || 0), 0);
    console.log(`Total amount of tax: ${totalTax}`);

    // Total amount of tax for each currency
    const totalTaxByCurrency: { [currency: string]: number } = invoices.reduce((taxes: { [currency: string]: number }, invoice) => {
      const { currency, tax = 0 } = invoice;
      taxes[currency] = (taxes[currency] || 0) + tax;
      return taxes;
    }, {});
    console.log(`Total amount of tax for each currency: ${JSON.stringify(totalTaxByCurrency)}`);

  } catch (error) {
    console.error("An error occurred while reading the invoices data:", error);
  }
};

readInvoicesData();
