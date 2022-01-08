export interface Product {
  id?: number;
  sku?: string;
  created_at?: string;
  deleted?: boolean;
  quantity?: number;
  name: string;
  barcode: string;
  price: number;
  final_price: number;
}

export type ProductQuantityOperation = "ADD" | "REMOVE";

export interface IUpdateQuantity {
  id: number;
  quantity: number;
  operation: ProductQuantityOperation;
}
