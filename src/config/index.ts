const INVOICES_CONFIG = {
  ONLY_PAID_INVOICES: true, //paid invoice contain refunded invoices too
  EXCLUDE_0_AMOUNT_INVOICES: true, //exclude invoices with 0 amount (free trials, etc.)
  EXPORT_JSON: true, //export invoices to a json file (to be used later for importing into your database)
};

const SUBSCRIPTIONS_CONFIG = {
  EXCLUDED_PRICES: [ //subscriptions prices to exclude from the migration (e.g. free plans, etc.)
    "price_1J5J1XJZ1jK5ZzJZJZJZJZJZ", //optional, only if you want to clean things up
    "price_1J5J1XJZ1jK5ZzJZJZJZJZJZ",
  ],
};
/**
 *  be careful if you want to disable some migrations, 
 *  you need to make sure that the dependencies are migrated first
 *  and that all function dont need the disabled migration
 */
const CONFIG = {
  MIGRATE: {
    PRODUCTS: true,
    PRICES: true,
    COUPONS: true,
    PROMOTION_CODES: true,
    PAYMENT_LINKS: true,
    SUBSCRIPTIONS: true,
    SUBSCRIPTION_SCHEDULES: false,
    INVOICES: true,
  },
};

export { CONFIG, INVOICES_CONFIG, SUBSCRIPTIONS_CONFIG };
