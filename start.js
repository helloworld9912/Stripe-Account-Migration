require("dotenv").config();

const { migrateCoupons } = require("./scripts/coupons_codes");
const { migrateProducts } = require("./scripts/products");
const { migratePrices } = require("./scripts/prices");
const {CONFIG} = require("./config");

const { COUPONS, PRODUCTS, PRICES } = CONFIG.MIGRATE;
/**
 * @fileoverview This is the entry point for the application.
 *
 */

async function start() {
  console.log("Starting the migration process of your stripe data...");

  //migrate coupons code from source to destination stripe
 if(COUPONS) await migrateCoupons()
    .then(() => {
      console.log("Migration of coupons completed with success.");
    })
    .catch((err) => {
      console.error("Migration of coupons failed!");
      console.error(err);
    });

  //migrate products and prices from source to destination stripe
  console.log("Starting the migration of products and prices...");
  if(PRODUCTS) await migrateProducts()
        .then(() => {
            console.log("Migration of products completed with success.");
        })
        .catch((err) => {
            console.error("Migration of products failed!");
            console.error(err);
        });

 //migrate prices from source to destination stripe
    console.log("Starting the migration of prices...");
    if(PRICES) await migratePrices()
        .then(() => {
            console.log("Migration of prices completed with success.");
        })
        .catch((err) => {
            console.error("Migration of prices failed!");
            console.error(err);
        });


  console.log("Migration process completed.");
}

start();
