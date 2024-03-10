require("dotenv").config();
const Stripe = require("stripe");

const PAGE_SIZE = 100;

const SOURCE_STRIPE_SECRET_KEY = process.env.SOURCE_STRIPE_SECRET_KEY;
const DESTINATION_STRIPE_SECRET_KEY = process.env.DESTINATION_STRIPE_SECRET_KEY;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

async function createProduct(productData) {
  let {
    id,
    name,
    description,
    attributes,
    images,
    active,
    metadata,
    default_price_data,
    features,
    package_dimensions,
    shippable,
    statement_descriptor,
    tax_code,
    unit_label,
    url,
  } = productData;

  let newProductData = {};
  if (id) newProductData.id = id;
  if (name) newProductData.name = name;
  if (description) newProductData.description = description;
  if (attributes) newProductData.attributes = attributes;
  if (images) newProductData.images = images;
  if (active) newProductData.active = active;
  if (metadata) newProductData.metadata = metadata;
  if (default_price_data)
    newProductData.default_price_data = default_price_data;
  if (features) newProductData.features = features;
  if (package_dimensions)
    newProductData.package_dimensions = package_dimensions;
  if (shippable) newProductData.shippable = shippable;
  if (statement_descriptor)
    newProductData.statement_descriptor = statement_descriptor;
  if (tax_code) newProductData.tax_code = tax_code;
  if (unit_label) newProductData.unit_label = unit_label;
  if (url) newProductData.url = url;

  const newProduct = await destinationStripe.products.create(newProductData);
  return newProduct;
}

async function getAllPrices(productId) {
    let prices = [];
    let hasMore = true;
    let startingAfter = null;
  
  
    let request_params = {
      limit: PAGE_SIZE,
      product: productId,
    }
  
    if(startingAfter) {
      request_params.starting_after = startingAfter;
    }
  
    while (hasMore) {
      const response = await sourceStripe.prices.list(request_params);
  
      prices = prices.concat(response.data);
  
      if (response.has_more && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
  
    return prices.reverse(); // reverse the array to keep the same historical order as the source
}

async function getAllProducts() {
  let products = [];
  let hasMore = true;
  let startingAfter = null;

  let request_params = {
    limit: PAGE_SIZE,
  };

  if (startingAfter) {
    request_params.starting_after = startingAfter;
  }

  while (hasMore) {
    const response = await sourceStripe.products.list(request_params);

    products = products.concat(response.data);

    if (response.has_more && response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  return products.reverse(); // reverse the array to keep the same historical order as the source
}

async function migrateProducts() {
  const products = await getAllProducts();

  console.log(`Found ${products.length} products.`);

  for (let product of products) {
    try {
      const newProduct = await createProduct(product);
      console.log(`New product created: ${newProduct.id}`);

      const prices = await getAllPrices(product.id);
      console.log(`Found ${prices.length} prices for product ${product.id}`);
    } catch (err) {
      const { message } = err;
      console.error(`Failed to migrate product: ${product.id} - reason: ${message}`);
    }
  }
}

module.exports = { migrateProducts };
