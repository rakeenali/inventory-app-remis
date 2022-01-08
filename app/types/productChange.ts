export interface IProductChange {
  created_at?: Date;
  deleted?: boolean;
  id?: number;
  product_id: number;
  previous_quantity: number;
  updated_quantity: number;
}
