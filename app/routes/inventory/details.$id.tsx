import { Product, ProductChange } from "@prisma/client";
import { format } from "date-fns";
import { LoaderFunction, useLoaderData } from "remix";

import { HeaderComponent } from "~/components/Header.component";
import { getProductChangeByProductId } from "~/repository/productChange.repository";
import { searchProducts } from "~/repository/products.repository";
import { formatDate, integerCheck } from "~/utils";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  if (id && integerCheck(id)) {
    const products = await searchProducts(id);
    if (products && products.length) {
      const productChanges = await getProductChangeByProductId(products[0].id);

      return {
        product: products[0],
        productChanges,
      };
    }
  }

  throw new Response("Not Found", { status: 404 });
};

type LoaderData = {
  product: Product;
  productChanges: ProductChange[];
};

export default function InventoryDetails() {
  const { product, productChanges } = useLoaderData<LoaderData>();

  const renderProductChanges = () => {
    return productChanges.map((pc, idx) => {
      return (
        <tr key={pc.id + "product-changes"}>
          <td>{idx + 1}</td>
          <td>{pc.previous_quantity}</td>
          <td>{pc.updated_quantity}</td>
          <td>{formatDate(pc.created_at)}</td>
        </tr>
      );
    });
  };

  return (
    <>
      <HeaderComponent
        heading={`Product Details - #${product.id}`}
        buttonText="Go Back"
        to="/inventory"
      />
      <div className="row">
        <div className="six columns">
          <h3>{product.name}</h3>
          <p>
            <strong>Barcode: </strong>
            {product.barcode}
          </p>
          <p>
            <strong>Quantity: </strong>
            {product.quantity}
          </p>
          <p>
            <strong>Created At: </strong>
            {formatDate(product.created_at)}
          </p>
        </div>
      </div>
      <hr />
      <h4>Inventory History</h4>
      <table className="u-full-width">
        <thead>
          <tr>
            <th>#</th>
            <th>Previous Quantity</th>
            <th>Updated Quantity</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>{renderProductChanges()}</tbody>
      </table>
    </>
  );
}
