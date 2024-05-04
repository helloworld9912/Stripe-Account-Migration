interface MigrationConfig {
  COUPONS: boolean;
  PRODUCTS: boolean;
  PRICES: boolean;
}

interface AppConfig {
  MIGRATE: MigrationConfig;
}

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

const CONFIG: AppConfig = {
  MIGRATE: {
    COUPONS: false,
    PRODUCTS: false,
    PRICES: true,
  },
};

export { CONFIG, INVOICES_CONFIG, SUBSCRIPTIONS_CONFIG };
