import mongoose, { Model, model, Schema } from 'mongoose';

export interface IStripeInvoice {
  id: string;
  object: string;
  account_country: string;
  account_name: string;
  account_tax_ids: null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping: number;
  application: null;
  application_fee_amount: null;
  attempt_count: number;
  attempted: boolean;
  auto_advance: boolean;
  automatic_tax: {
    enabled: boolean;
    liability: {
      type: string;
    };
    status: string;
  };
  billing_reason: string;
  charge: string;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: null;
  customer: string;
  customer_address: {
    city: string | null;
    country: string;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  };
  customer_email: string;
  customer_name: string | null;
  customer_phone: null;
  customer_shipping: null;
  customer_tax_exempt: string;
  customer_tax_ids: string[];
  default_payment_method: null;
  default_source: null;
  default_tax_rates: string[];
  description: null;
  discount: null;
  discounts: string[];
  due_date: null;
  effective_at: number;
  ending_balance: number;
  footer: null;
  from_invoice: null;
  hosted_invoice_url: string;
  invoice_pdf: string;
  issuer: {
    type: string;
  };
  last_finalization_error: null;
  latest_revision: null;
  lines: {
    object: string;
    data: {
      id: string;
      object: string;
      amount: number;
      amount_excluding_tax: number;
      currency: string;
      description: string;
      discount_amounts: string[];
      discountable: boolean;
      discounts: string[];
      invoice: string;
      livemode: boolean;
      metadata: object;
      period: {
        end: number;
        start: number;
      };
      plan: {
        id: string;
        object: string;
        active: boolean;
        aggregate_usage: null;
        amount: number;
        amount_decimal: string;
        billing_scheme: string;
        created: number;
        currency: string;
        interval: string;
        interval_count: number;
        livemode: boolean;
        metadata: object;
        meter: null;
        nickname: string;
        product: string;
        tiers_mode: null;
        transform_usage: null;
        trial_period_days: null;
        usage_type: string;
      };
      price: {
        id: string;
        object: string;
        active: boolean;
        billing_scheme: string;
        created: number;
        currency: string;
        custom_unit_amount: null;
        livemode: boolean;
        lookup_key: null;
        metadata: object;
        nickname: string;
        product: string;
        recurring: {
          aggregate_usage: null;
          interval: string;
          interval_count: number;
          meter: null;
          trial_period_days: null;
          usage_type: string;
        };
        tax_behavior: string;
        tiers_mode: null;
        transform_quantity: null;
        type: string;
        unit_amount: number;
        unit_amount_decimal: string;
      };
      proration: boolean;
      proration_details: {
        credited_items: null;
      };
      quantity: number;
      subscription: string;
      subscription_item: string;
      tax_amounts: {
        amount: number;
        inclusive: boolean;
        tax_rate: string;
        taxability_reason: string;
        taxable_amount: number;
      }[];
      tax_rates: string[];
      type: string;
      unit_amount_excluding_tax: string;
    }[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  livemode: boolean;
  metadata: object;
  next_payment_attempt: null;
  number: string;
  on_behalf_of: null;
  paid: boolean;
  paid_out_of_band: boolean;
  payment_intent: string;
  payment_settings: {
    default_mandate: null;
    payment_method_options: null;
    payment_method_types: null;
  };
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  quote: null;
  receipt_number: null;
  rendering: null;
  rendering_options: null;
  shipping_cost: null;
  shipping_details: null;
  starting_balance: number;
  statement_descriptor: null;
  status: string;
  status_transitions: {
    finalized_at: number;
    marked_uncollectible_at: null;
    paid_at: number;
    voided_at: null;
  };
  subscription: string;
  subscription_details: {
    metadata: null;
  };
  subtotal: number;
  subtotal_excluding_tax: number;
  tax: number;
  test_clock: null;
  total: number;
  total_discount_amounts: string[];
  total_excluding_tax: number;
  total_tax_amounts: {
    amount: number;
    inclusive: boolean;
    tax_rate: string;
    taxability_reason: string;
    taxable_amount: number;
  }[];
  transfer_data: null;
  webhooks_delivered_at: number;
}

const StripeInvoiceSchema: Schema = new Schema({
  id: { type: String, required: true },
  object: { type: String, required: true },
  account_country: { type: String, required: true },
  account_name: { type: String, required: true },
  account_tax_ids: { type: Schema.Types.Mixed, required: false },
  amount_due: { type: Number, required: true },
  amount_paid: { type: Number, required: true },
  amount_remaining: { type: Number, required: true },
  amount_shipping: { type: Number, required: true },
  application: { type: Schema.Types.Mixed, required: false },
  application_fee_amount: { type: Schema.Types.Mixed, required: false },
  attempt_count: { type: Number, required: true },
  attempted: { type: Boolean, required: true },
  auto_advance: { type: Boolean, required: true },
  automatic_tax: {
    enabled: { type: Boolean, required: true },
    liability: {
      type: { type: String, required: true },
    },
    status: { type: String, required: true },
  },
  billing_reason: { type: String, required: true },
  charge: { type: String, required: true },
  collection_method: { type: String, required: true },
  created: { type: Number, required: true },
  currency: { type: String, required: true },
  custom_fields: { type: Schema.Types.Mixed, required: false },
  customer: { type: String, required: true },
  customer_address: {
    city: { type: String, required: false },
    country: { type: String, required: true },
    line1: { type: String, required: false },
    line2: { type: String, required: false },
    postal_code: { type: String, required: false },
    state: { type: String, required: false },
  },
  customer_email: { type: String, required: true },
  customer_name: { type: String, required: false },
  customer_phone: { type: Schema.Types.Mixed, required: false },
  customer_shipping: { type: Schema.Types.Mixed, required: false },
  customer_tax_exempt: { type: String, required: true },
  customer_tax_ids: { type: [String], required: true },
  default_payment_method: { type: Schema.Types.Mixed, required: false },
  default_source: { type: Schema.Types.Mixed, required: false },
  default_tax_rates: { type: [String], required: true },
  description: { type: Schema.Types.Mixed, required: false },
  discount: { type: Schema.Types.Mixed, required: false },
  discounts: { type: [String], required: true },
  due_date: { type: Schema.Types.Mixed, required: false },
  effective_at: { type: Number, required: true },
  ending_balance: { type: Number, required: true },
  footer: { type: Schema.Types.Mixed, required: false },
  from_invoice: { type: Schema.Types.Mixed, required: false },
  hosted_invoice_url: { type: String, required: true },
  invoice_pdf: { type: String, required: true },
  issuer: {
    type: { type: String, required: true },
  },
  last_finalization_error: { type: Schema.Types.Mixed, required: false },
  latest_revision: { type: Schema.Types.Mixed, required: false },
  lines: {
    object: { type: String, required: true },
    data: [{
      id: { type: String, required: true },
      object: { type: String, required: true },
      amount: { type: Number, required: true },
      amount_excluding_tax: { type: Number, required: true },
      currency: { type: String, required: true },
      description: { type: String, required: true },
      discount_amounts: { type: [String], required: true },
      discountable: { type: Boolean, required: true },
      discounts: { type: [String], required: true },
      invoice: { type: String, required: true },
      livemode: { type: Boolean, required: true },
      metadata: { type: Schema.Types.Mixed, required: true },
      period: {
        end: { type: Number, required: true },
        start: { type: Number, required: true },
      },
      plan: {
        id: { type: String, required: true },
        object: { type: String, required: true },
        active: { type: Boolean, required: true },
        aggregate_usage: { type: Schema.Types.Mixed, required: false },
        amount: { type: Number, required: true },
        amount_decimal: { type: String, required: true },
        billing_scheme: { type: String, required: true },
        created: { type: Number, required: true },
        currency: { type: String, required: true },
        interval: { type: String, required: true },
        interval_count: { type: Number, required: true },
        livemode: { type: Boolean, required: true },
        metadata: { type: Schema.Types.Mixed, required: true },
        meter: { type: Schema.Types.Mixed, required: false },
        nickname: { type: String, required: true },
        product: { type: String, required: true },
        tiers_mode: { type: Schema.Types.Mixed, required: false },
        transform_usage: { type: Schema.Types.Mixed, required: false },
        trial_period_days: { type: Schema.Types.Mixed, required: false },
        usage_type: { type: String, required: true },
      },
      price: {
        id: { type: String, required: true },
        object: { type: String, required: true },
        active: { type: Boolean, required: true },
        billing_scheme: { type: String, required: true },
        created: { type: Number, required: true },
        currency: { type: String, required: true },
        custom_unit_amount: { type: Schema.Types.Mixed, required: false },
        livemode: { type: Boolean, required: true },
        lookup_key: { type: Schema.Types.Mixed, required: false },
        metadata: { type: Schema.Types.Mixed, required: true },
        nickname: { type: String, required: true },
        product: { type: String, required: true },
        recurring: {
          aggregate_usage: { type: Schema.Types.Mixed, required: false },
          interval: { type: String, required: true },
          interval_count: { type: Number, required: true },
          meter: { type: Schema.Types.Mixed, required: false },
          trial_period_days: { type: Schema.Types.Mixed, required: false },
          usage_type: { type: String, required: true },
        },
        tax_behavior: { type: String, required: true },
        tiers_mode: { type: Schema.Types.Mixed, required: false },
        transform_quantity: { type: Schema.Types.Mixed, required: false },
        type: { type: String, required: true },
        unit_amount: { type: Number, required: true },
        unit_amount_decimal: { type: String, required: true },
      },
      proration: { type: Boolean, required: true },
      proration_details: {
        credited_items: { type: Schema.Types.Mixed, required: false },
      },
      quantity: { type: Number, required: true },
      subscription: { type: String, required: true },
      subscription_item: { type: String, required: true },
      tax_amounts: [{
        amount: { type: Number, required: true },
        inclusive: { type: Boolean, required: true },
        tax_rate: { type: String, required: true },
        taxability_reason: { type: String, required: true },
        taxable_amount: { type: Number, required: true },
      }],
      tax_rates: { type: [String], required: true },
      type: { type: String, required: true },
      unit_amount_excluding_tax: { type: String, required: true },
    }],
    has_more: { type: Boolean, required: true },
    total_count: { type: Number, required: true },
    url: { type: String, required: true },
  },
  livemode: { type: Boolean, required: true },
  metadata: { type: Schema.Types.Mixed, required: true },
  next_payment_attempt: { type: Schema.Types.Mixed, required: false },
  number: { type: String, required: true },
  on_behalf_of: { type: Schema.Types.Mixed, required: false },
  paid: { type: Boolean, required: true },
  paid_out_of_band: { type: Boolean, required: true },
  payment_intent: { type: String, required: true },
  payment_settings: {
    default_mandate: { type: Schema.Types.Mixed, required: false },
    payment_method_options: { type: Schema.Types.Mixed, required: false },
    payment_method_types: { type: Schema.Types.Mixed, required: false },
  },
  period_end: { type: Number, required: true },
  period_start: { type: Number, required: true },
  post_payment_credit_notes_amount: { type: Number, required: true },
  pre_payment_credit_notes_amount: { type: Number, required: true },
  quote: { type: Schema.Types.Mixed, required: false },
  receipt_number: { type: Schema.Types.Mixed, required: false },
  rendering: { type: Schema.Types.Mixed, required: false },
  rendering_options: { type: Schema.Types.Mixed, required: false },
  shipping_cost: { type: Schema.Types.Mixed, required: false },
  shipping_details: { type: Schema.Types.Mixed, required: false },
  starting_balance: { type: Number, required: true },
  statement_descriptor: { type: Schema.Types.Mixed, required: false },
  status: { type: String, required: true },
  status_transitions: {
  finalized_at: { type: Number, required: true },
  marked_uncollectible_at: { type: Schema.Types.Mixed, required: false },
  paid_at: { type: Number, required: true },
  voided_at: { type: Schema.Types.Mixed, required: false },
  },
  subscription: { type: String, required: true },
  subscription_details: {
  metadata: { type: Schema.Types.Mixed, required: false },
  },
  subtotal: { type: Number, required: true },
  subtotal_excluding_tax: { type: Number, required: true },
  tax: { type: Number, required: true },
  test_clock: { type: Schema.Types.Mixed, required: false },
  total: { type: Number, required: true },
  total_discount_amounts: { type: [String], required: true },
  total_excluding_tax: { type: Number, required: true },
  total_tax_amounts: [{
  amount: { type: Number, required: true },
  inclusive: { type: Boolean, required: true },
  tax_rate: { type: String, required: true },
  taxability_reason: { type: String, required: true },
  taxable_amount: { type: Number, required: true },
  }],
  transfer_data: { type: Schema.Types.Mixed, required: false },
  webhooks_delivered_at: { type: Number, required: true },
  });
  
  const StripeInvoices: Model<IStripeInvoice> = mongoose.models.StripeInvoices || model('StripeInvoices', StripeInvoiceSchema);
  
  export default StripeInvoices;
  
  
