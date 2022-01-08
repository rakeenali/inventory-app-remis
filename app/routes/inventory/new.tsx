import { Form, redirect } from "remix";
import type { ActionFunction } from "remix";

import { HeaderComponent } from "~/components/Header.component";
import { createProduct } from "~/repository/products.repository";
import { InputComponent } from "~/components/Input.component";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const name = body.get("name");
  const barcode = body.get("barcode");
  const price = body.get("price");
  const finalPrice = body.get("finalPrice");
  const quantity = body.get("quantity");

  await createProduct({
    name: name?.toString() || "",
    barcode: barcode?.toString() || "",
    quantity: Number(quantity?.toString() || ""),
    price: Number(price?.toString() || ""),
    final_price: Number(finalPrice?.toString() || ""),
  });

  return redirect("/inventory");
};

export default function InventoryNew() {
  return (
    <>
      <HeaderComponent
        heading="Create new Product"
        to="/inventory"
        buttonText="Go Back"
      />
      <hr />
      <Form method="post" action="/inventory/new">
        <div className="row">
          <InputComponent required={true} label="Product Name" name="name" />
          <InputComponent required={true} label="Barcode" name="barcode" />
          <InputComponent
            required={true}
            label="Quantity"
            name="quantity"
            type="number"
          />
          <InputComponent
            required={true}
            label="Price"
            name="price"
            type="number"
          />
          <InputComponent
            required={true}
            label="Final Price"
            name="finalPrice"
            type="number"
          />
          <div className="twelve columns mb-10 ">
            <button
              className="button button-primary u-full-width mb-10"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </Form>
    </>
  );
}
