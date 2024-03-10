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
  
  export { CONFIG };
  