import { Product } from "@prisma/client";

export interface IInvoice {
  created_at?: Date;
  deleted?: boolean;
  id?: number;
  name: string;
  amount: number;
  discount: number;
  final_amount: number;
  product_quantity: number;

  // Relations
  InvoiceProducts?: IInvoiceProducts[];
}

export interface IInvoiceProducts {
  created_at?: Date;
  id?: number;
  invoice_id: number;
  product_id: number;
  actual_price: number;
  quantity: number;
  final_price: number;

  // Relations
  product?: Product;
}
