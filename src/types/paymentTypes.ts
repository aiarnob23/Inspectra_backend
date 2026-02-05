type DiscountType = "PERCENTAGE" | "FIXED";

export interface DiscountInput {
  amountMinor: number;          // base amount in minor units
  type: DiscountType;           // PERCENTAGE | FIXED
  value: number;                // percent (0–100) OR fixed minor units
  maxDiscountMinor?: number;    // optional cap
}

type TaxType = "PERCENTAGE" | "FIXED";

export interface TaxInput {
  amountMinor: number;        // taxable amount in minor units
  type: TaxType;              // PERCENTAGE | FIXED
  value: number;              // percent (0–100) OR fixed minor units
  inclusive?: boolean;        // tax inclusive or exclusive
  maxTaxMinor?: number;       // optional cap
}