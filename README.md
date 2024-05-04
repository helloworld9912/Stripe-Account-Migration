# Stripe Account Migration ToolKit V1.0

A collection of tools to help you migrate a stripe account to a new account without losing data

## Introduction

This repository contains a collection of tools to help you migrate a stripe account to a new account without losing data. This is useful when you want to move your main used account to another country, or when you want to transfer your account to another person or company (for example, when you sell your business).

## Usage:

### Install the dependencies:

```bash
npm install
```

or

```bash
yarn install
```

### Create a .env file with the following content:

```bash
SOURCE_STRIPE_SECRET_KEY=""
DESTINATION_STRIPE_SECRET_KEY=""
```

### Inventory the data you want to migrate:

```bash
npm run inventory
```

or
```bash
yarn inventory
```

### Run the migration script:

```bash
npm run migrate
```

or
```bash
yarn migrate
```

## How to copy PAN data from the old account to the new account ?

Follow this link from stripe documentation to copy PAN data from the old account to the new account:
https://docs.stripe.com/payments/account/data-migrations/pan-copy-self-serve

## What information can be migrated from the old account to the new account using the stripe process?

The following information can be migrated from the old account to the new account using the stripe process:

- [Customer](https://docs.stripe.com/api/customers/object) objects (keeping the same customer id)
- [Card](https://docs.stripe.com/api/cards/object) objects
- [Source](https://docs.stripe.com/api/sources/object) objects
- [Payment Methods](https://docs.stripe.com/api/payment_methods/object) objects (except: SEPA, Bacs, ACH)
- [Bank Accounts](https://docs.stripe.com/api/customer_bank_accounts/object) objects

## What information can not be migrated from the old account to the new account using the stripe process?

The following information can not be migrated from the old account to the new account using the stripe process: (and that's why we created this repository)

- [Charges](https://docs.stripe.com/api/charges/object) objects
- [Payment Intents](https://docs.stripe.com/api/payment_intents/object) objects
- [Invoices](https://docs.stripe.com/api/invoices/object) objects
- [Plans](https://docs.stripe.com/api/plans/object) objects
- [Subscription](https://docs.stripe.com/api/subscriptions/object) objects
- [Products](https://docs.stripe.com/api/products/object) objects
- [Coupons](https://docs.stripe.com/api/coupons/object) objects
- [Discounts](https://docs.stripe.com/api/discounts/object) objects
- [Events](https://docs.stripe.com/api/discounts/object) objects
- [Refunds](https://docs.stripe.com/api/refunds/object) objects
- [Transfers](https://docs.stripe.com/api/transfers/object) objects
- [Payouts](https://docs.stripe.com/api/payouts/object) objects
- [Logs](https://docs.stripe.com/api/) objects
- [Guest Customer](https://support.stripe.com/questions/guest-customer-faq) objects
  ... and more

## What information can I migrated using this repository?

The following information can be migrated using this repository:

- [Coupons](https://docs.stripe.com/api/coupons/object) objects ✅ (migrated without any changes, conserving the same coupon id and details)
- [Promotion Codes](https://docs.stripe.com/api/promotion_codes/object) objects ✅ (migrated without any changes, conserving the same promotion code id and details)
- [Products](https://docs.stripe.com/api/products/object) objects ✅ (migrated without any changes, conserving the same product id and details)
- [Prices](https://docs.stripe.com/api/prices) objects ✅ - prices is special, because all prices ids cannot be migrated due to the limitation of stripe API, we cannot specify a specific price ID when creating a new price ID on the destination account, so we have to create new prices in the new account and update the subscriptions to use the new prices ids, using a mapping file.
- [Plans](https://docs.stripe.com/api/plans/object) objects ✅ - You can model subscriptions with more flexibly using the Prices API. It replaces the Plans API and is backwards compatible to simplify migration. so we use the prices API to migrate all the plans (if we have any)
- [Subscriptions](https://docs.stripe.com/api/subscriptions/object) objects ✅ - subscriptions are linked to the prices, so we have to update the subscriptions using the new prices ids, using the mapping file created when migrating the prices.
- [Subscription Schedules](https://docs.stripe.com/api/plans/object) objects ✅ 


## How to perform a complete migration?

To perform a complete migration, you need to follow these steps:

  [ ] - Put your website in maintenance mode to avoid getting new customers, subscriptions,...
  [ ] - Start the PAN migration process to get customers objects and payment method on your destination account (https://docs.stripe.com/get-started/data-migrations/pan-import)
  [ ] - Run the inventory script to understand the quantity of data to migrate
  [ ] - Start the migration process using the `migrate` script
  [ ] - Update your website to use the new stripe API keys (destination account)
  [ ] - Test your website to make sure everything is working fine
  [ ] - (Optional) - migrate invoice (special*)
  [ ] - Pause ALL subscriptions on the source account (to avoid customer being billed 2 times for the same service)
  [ ] - Update your `prices` reference in your app code if needed using the mapping file
  [ ] - Stop the maintenance mode

## How to use this repository?

Install the dependencies:

```
npm install
```

Edit the config.js file to set the data you want to migrate to your new account. For example:

```
COUPONS: false, // set to true if you want to migrate coupons
PRODUCTS: true, // set to true if you want to migrate products
PRICES: true, // set to true if you want to migrate prices
```

Create a .env file with the following content:

```
STRIPE_SECRET_KEY_OLD=sk_test_...
STRIPE_SECRET_KEY_NEW=sk_test_...
```

Run the migration script:

```
npm run migrate
```

## How to contribute?

If you want to contribute to this repository, please follow the following steps:

- Fork this repository
- Create a new branch
- Make your changes
- Create a pull request
- Wait for the review

## License

This repository is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Authors

- [**The Cheems Dev**](https://github.com/helloworld9912) - _Initial work_

## Disclaimer

Use this repository at your own risk. We are not responsible for any data loss or any other issues that may occur when using this repository. Always make sure to have a backup of your data before using this repository to migrate your stripe account.

WE ARE NOT AFFILIATED WITH STRIPE. THIS IS AN UNOFFICIAL REPOSITORY. PLEASE USE THIS REPOSITORY AT YOUR OWN RISK.
