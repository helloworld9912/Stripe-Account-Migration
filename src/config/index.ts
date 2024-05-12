const INVOICES_CONFIG = {
  ONLY_PAID_INVOICES: true, //paid invoice contain refunded invoices too
  EXCLUDE_0_AMOUNT_INVOICES: true, //exclude invoices with 0 amount (free trials, etc.)
  EXPORT_JSON: true, //export invoices to a json file (to be used later for importing into your database)
};

const SUBSCRIPTIONS_CONFIG = {
  EXPORT_JSON: true, //export subscriptions to a json file
  SHOW_PROGRESS: true,
  EXCLUDED_PRICES: [ //subscriptions prices to exclude from the migration (e.g. free plans, etc.)
    "price_1MuCMJBsJM7cX1YeUg3wQc6P", //optional, only if you want to clean things up
    "price_1Mj9QoBsJM7cX1YeLoK9Moro",
  ],
};
/**
 *  be careful if you want to disable some migrations, 
 *  you need to make sure that the dependencies are migrated first
 *  and that all function dont need the disabled migration
 */
const CONFIG = {
  MIGRATE: {
    PRODUCTS: false, //done
    PRICES: false, //done
    COUPONS: false, //done
    PROMOTION_CODES: false,
    PAYMENT_LINKS: false,
    SUBSCRIPTIONS: true, // except "incomplete", "incomplete_expired", "canceled"
    SUBSCRIPTION_SCHEDULES: false,
    INVOICES: false,
  },
};

export { CONFIG, INVOICES_CONFIG, SUBSCRIPTIONS_CONFIG };
