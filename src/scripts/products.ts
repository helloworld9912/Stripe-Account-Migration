import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

interface IProductListRequestParams {
  limit: number;
  starting_after?: string;
}

// Stripe configuration and initialisation
const PAGE_SIZE = 100;
const SOURCE_STRIPE_SECRET_KEY: string = process.env
  .SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env
  .DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

function convertToProductCreateParams(
  product: Stripe.Product
): Stripe.ProductCreateParams {
  let productCreateParams: Stripe.ProductCreateParams = {
    name: product.name,
  };

  if (product.id) productCreateParams.id = product.id;

  if (product.active) productCreateParams.active = product.active;
  if (product.description)
    productCreateParams.description = product.description;

  if (product.metadata) productCreateParams.metadata = product.metadata;

  //default price is not implemented yet (to avoid conflicts with prices migration)

  const features = product.features as Stripe.Product.Feature[];

  const filteredFeatures: Stripe.ProductCreateParams.Feature[] = features
    .filter((feature) => feature.name !== undefined)
    .map((feature) => {
      return {
        name: feature.name as string,
      };
    });

  if (features) productCreateParams.features = filteredFeatures;

  if (product.images) productCreateParams.images = product.images;
  if (product.package_dimensions)
    productCreateParams.package_dimensions = product.package_dimensions;
  if (product.shippable) productCreateParams.shippable = product.shippable;
  if (product.statement_descriptor)
    productCreateParams.statement_descriptor = product.statement_descriptor;
  if (typeof product.tax_code === "string")
    productCreateParams.tax_code = product.tax_code;
  if (product.unit_label) productCreateParams.unit_label = product.unit_label;
  if (product.url) productCreateParams.url = product.url;

  return productCreateParams;
}

// Function to create a product on destination Stripe account
async function createProduct(
  product: Stripe.Product
): Promise<Stripe.Response<Stripe.Product>> {
  const productCreateParams = convertToProductCreateParams(product);
  return destinationStripe.products.create(productCreateParams);
}

// Function to retrieve all products from the source Stripe account
export async function getAllProducts(): Promise<Stripe.Product[]> {
  let products: Stripe.Product[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: IProductListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    const response = await sourceStripe.products.list(request_params);

    products = products.concat(response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return products.reverse();
}

// Function to migrate products
async function migrateProducts(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }

  console.log("Starting the migration of products...");
  const products = await getAllProducts();
  console.log(`Total of products to migrate: ${products.length}`);

  for (let product of products) {
    try {
      const newProduct = await createProduct(product);
      console.log(`New product created: ${newProduct.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create product: ${product.id} - reason: ${message}`
      );
    }
  }
}
export { migrateProducts };
