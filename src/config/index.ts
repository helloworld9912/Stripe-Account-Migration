interface MigrationConfig {
    COUPONS: boolean;
    PRODUCTS: boolean;
    PRICES: boolean;
  }
  
  interface AppConfig {
    MIGRATE: MigrationConfig;
  }
  
  const CONFIG: AppConfig = {
    MIGRATE: {
      COUPONS: false,
      PRODUCTS: false,
      PRICES: true,
    },
  };

  const INVOICES_CONFIG = {
    ONLY_PAID_INVOICES: true, //paid invoice contain refunded invoices too
    EXCLUDE_0_AMOUNT_INVOICES: true, //exclude invoices with 0 amount (free trials, etc.)
    EXPORT_JSON: true, //export invoices to a json file (to be used later for importing into your database)
  };

  
  export { CONFIG, INVOICES_CONFIG };
  