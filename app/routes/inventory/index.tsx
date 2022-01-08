import { Product } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "remix";
import { useLoaderData, Form, useSearchParams, Link } from "remix";
import { format } from "date-fns";

import { db } from "~/repository/db.server";
import { HeaderComponent } from "~/components/Header.component";
import {
  deleteProduct,
  getAllProducts,
  searchProducts,
} from "~/repository/products.repository";
import { integerCheck } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();

  let products: Product[] = [];

  if (search) {
    products = await searchProducts(search);
  } else {
    products = await getAllProducts();
  }

  return {
    products,
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_method") === "delete") {
    const productId = form.get("productId")?.toString();
    if (productId && integerCheck(productId)) {
      await deleteProduct(parseInt(productId));
      return redirect("/inventory");
    }
  }
};

type LoaderProps = {
  products: Product[];
};

export default function InventoryIndex() {
  const data = useLoaderData<LoaderProps>();
  const [searchParams] = useSearchParams();
  const searchText = searchParams.get("search")?.trim() ?? "";

  const renderProducts = () => {
    return data.products.map((product) => {
      return (
        <tr key={product.id + "products"}>
          <td>{product.id}</td>
          <td>
            <Link to={`details/${product.id}`}>{product.name}</Link>
          </td>
          <td>{product.barcode}</td>
          <td>{product.quantity}</td>
          <td>{product.price}</td>
          <td>{product.final_price}</td>
          <td>
            {format(new Date(product.created_at), "hh:mm aaa / dd MMM y")}
          </td>
          <td>
            <Link to={`update/${product.id}`} className="button button-primary">
              Update
            </Link>
          </td>
          <td>
            <Form method="post" className="remove-margins">
              <input type="hidden" name="_method" defaultValue="delete" />
              <input type="hidden" name="productId" value={product.id} />
              <button>Delete</button>
            </Form>
          </td>
        </tr>
      );
    });
  };

  const searchForm = () => {
    return (
      <Form method="get" action="/inventory">
        <div className="row">
          <div className="six columns">&nbsp;</div>
          <div className="four columns">
            <input
              className="u-full-width"
              type="text"
              placeholder="Search Products"
              name="search"
              value={searchText}
              onChange={() => {
                // just to remove warning
              }}
            />
          </div>
          <div className="two columns">
            <button className="button-primary">Search</button>
          </div>
        </div>
      </Form>
    );
  };

  return (
    <>
      <HeaderComponent
        heading="Inventory Listing"
        buttonText="Create"
        to="/inventory/new"
      />
      {searchForm()}
      <table className="u-full-width">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Barcode</th>
            <th>Quantity</th>
            <th>Price (PKR)</th>
            <th>Final Price (PKR)</th>
            <th>Created At</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>{renderProducts()}</tbody>
      </table>
    </>
  );
}
