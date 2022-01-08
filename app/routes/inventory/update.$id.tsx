import { Product } from "@prisma/client";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { HeaderComponent } from "~/components/Header.component";
import { InputComponent } from "~/components/Input.component";
import {
  searchProducts,
  updateProduct,
  updateQuantity,
} from "~/repository/products.repository";
import { ProductQuantityOperation } from "~/types";
import { integerCheck } from "~/utils";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  if (id && integerCheck(id)) {
    const products = await searchProducts(id);
    if (products && products.length) {
      return {
        product: products[0],
      };
    }
  }

  throw new Response("Not Found", { status: 404 });
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const productId = body.get("_productId");
  const name = body.get("name");
  const barcode = body.get("barcode");
  const price = body.get("price");
  const finalPrice = body.get("finalPrice");
  const quantity = body.get("quantity");
  const quantityOperation =
    (body.get("quantityOperation")?.toString() as ProductQuantityOperation) ||
    "ADD";

  await updateProduct({
    name: name?.toString() || "",
    barcode: barcode?.toString() || "",
    price: Number(price?.toString() || ""),
    final_price: Number(finalPrice?.toString() || ""),
    id: Number(productId?.toString() || ""),
  });

  await updateQuantity({
    id: Number(productId?.toString() || ""),
    operation: quantityOperation,
    quantity: Number(quantity?.toString() || ""),
  });

  return redirect("/inventory");
  return {};
};

type LoaderData = {
  product: Product;
};

export default function InventoryUpdate() {
  const { product } = useLoaderData<LoaderData>();

  return (
    <>
      <HeaderComponent
        heading={`Update - ${product.name}`}
        buttonText="Go Back"
        to="/inventory"
      />
      <hr />
      <Form method="post">
        <div className="row">
          <InputComponent
            required={true}
            label="Product Name"
            name="name"
            defaultValue={product.name}
          />
          <InputComponent
            required={true}
            label="Barcode"
            name="barcode"
            defaultValue={product.barcode}
          />
          <div className="twelve columns">
            <div className="row">
              <InputComponent
                required={true}
                label="Quantity"
                name="quantity"
                type="number"
                defaultValue={product.quantity.toString()}
                fullWidth={false}
              />
              <div className="six columns">
                <label htmlFor="exampleEmailInput">Quantity Operation</label>
                <select className="u-full-width" name="quantityOperation">
                  <option value="ADD">Add</option>
                  <option value="REMOVE">Remove</option>
                </select>
              </div>
            </div>
          </div>
          <InputComponent
            required={true}
            label="Price"
            name="price"
            type="number"
            defaultValue={product.price.toString()}
          />
          <InputComponent
            required={true}
            label="Final Price"
            name="finalPrice"
            type="number"
            defaultValue={product.final_price.toString()}
          />
          <input type="hidden" name="_productId" defaultValue={product.id} />
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
