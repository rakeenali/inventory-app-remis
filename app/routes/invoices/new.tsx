import { Product } from "@prisma/client";
import { useMemo, useState } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "remix";

import { HeaderComponent } from "~/components/Header.component";
import { InputComponent } from "~/components/Input.component";
import { createInvoice } from "~/repository/invoices.repository";
import { searchProducts } from "~/repository/products.repository";
import { ICartInvoiceProduct } from "~/types/invoice";
import { calculateDiscount } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() || "";

  const products = await searchProducts(search);

  return {
    products,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const invoiceName = body.get("invoiceName")?.toString() || "";
  const invoiceAmount = parseInt(body.get("invoiceAmount")?.toString() || "");
  const discountValue = parseInt(body.get("discountValue")?.toString() || "");
  const finalAmount = parseInt(body.get("finalAmount")?.toString() || "");
  const cart = JSON.parse(body.get("cart")?.toString() || "") as CartState;
  const quantity = JSON.parse(
    body.get("quantity")?.toString() || ""
  ) as QuantityState;

  const invoiceProduct: ICartInvoiceProduct[] = [];
  for (let idx in cart) {
    invoiceProduct.push({
      id: parseInt(idx),
      quantity: quantity[idx],
      final_price: cart[idx].final_price,
    });
  }

  const invoice = await createInvoice({
    products: invoiceProduct,
    invoiceName: invoiceName,
    invoiceAmount: invoiceAmount,
    discountValue: discountValue,
    finalAmount: finalAmount,
  });

  return redirect(`/invoices/details/${invoice.id}`);
};

type LoaderProps = {
  products: Product[];
};

type QuantityState = {
  [k: string]: number;
};

type CartState = {
  [k: number]: Product;
};

export default function InvoiceNew() {
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(
    searchParams.get("search")?.trim() || ""
  );
  const [quantity, setQuantity] = useState<QuantityState>({});
  const [cart, setCart] = useState<CartState>({});

  const [canCreateInvoice, setCanCreateInvoice] = useState(false);
  const [discountValue, setDiscountValue] = useState<number>(0);

  const { products } = useLoaderData<LoaderProps>();
  const data = useActionData();

  const totalAmount = useMemo(() => {
    return Object.entries(cart).reduce((acc, [id, c]) => {
      return (acc += c.final_price * quantity[c.id]);
    }, 0);
  }, [cart, quantity]);

  const searchForm = () => {
    return (
      <Form method="get" action="/invoices/new">
        <div className="row">
          <div className="six columns">&nbsp;</div>
          <div className="four columns">
            <input
              className="u-full-width"
              type="text"
              placeholder="Search Products"
              name="search"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
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

  const addToCart = (product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: product }));
  };

  const renderProducts = () => {
    return (
      products?.slice(0, 10).map((product, idx) => {
        return (
          <tr key={product.id + "invoice-new-product" + idx}>
            <td>{idx + 1}</td>
            <td>{product.name}</td>
            <td>{product.quantity}</td>
            <td>{product.final_price}</td>
            <td>
              <div
                className="row"
                style={{ marginTop: "auto", marginBottom: "auto" }}
              >
                <div className="six columns">
                  <input
                    type="number"
                    name="quantity"
                    max={product.quantity}
                    min={1}
                    className="u-full-width"
                    placeholder="QTY"
                    value={quantity[product.id] || ""}
                    onChange={(e) => {
                      setQuantity((prev) => {
                        return {
                          ...prev,
                          [product.id]: parseInt(e.target.value),
                        };
                      });
                    }}
                  />
                </div>
                {quantity[product.id] && quantity[product.id] > 0 && (
                  <button
                    className="button-primary u-full-width six columns"
                    type="button"
                    onClick={() => {
                      addToCart(product);
                    }}
                  >
                    Add
                  </button>
                )}
              </div>
            </td>
          </tr>
        );
      }) || []
    );
  };

  const renderCart = () => {
    return Object.entries(cart).map(([id, c], idx) => {
      return (
        <tr key={c.id + "cart" + idx}>
          <td>{c.name}</td>
          <td>{quantity[c.id]}</td>
          <td>{c.final_price * quantity[c.id]}</td>
          <td>
            <button
              onClick={() => {
                setCart((prev) => {
                  const newCart = { ...prev };
                  delete newCart[c.id];
                  return newCart;
                });
              }}
            >
              Remove
            </button>
          </td>
        </tr>
      );
    });
  };

  const showBill = () => {
    if (Object.keys(cart).length === 0) {
      return <></>;
    }

    return (
      <>
        <div>
          <div className="six columns">&nbsp;</div>
          <div className="three columns u-full-width">
            <h4>
              Total Bill: <strong>{totalAmount}</strong>
            </h4>
          </div>
          <div className="three columns">
            <button
              className="button-primary u-full-width"
              onClick={() => {
                setCanCreateInvoice(true);
              }}
            >
              Prepare Invoice
            </button>
          </div>
        </div>
        <br />
      </>
    );
  };

  if (canCreateInvoice) {
    return (
      <>
        <div className="invoice-new">
          <HeaderComponent
            heading="Create Invoice"
            buttonText="Go back"
            to="/invoices"
          />
          <div className="row">
            <div className="eight columns">&nbsp;</div>
            <div className="four columns">
              <button
                className="button-primary u-full-width"
                onClick={() => {
                  setCanCreateInvoice(false);
                }}
              >
                Add More Products
              </button>
            </div>
          </div>
          <Form method="post" action="/invoices/new">
            <div className="row">
              <InputComponent
                required={true}
                label="Invoice Name"
                name="invoiceName"
              />
              <input
                className="u-full-width"
                type="number"
                placeholder="Invoice Amount"
                name="invoiceAmount"
                onChange={() => {}}
                value={totalAmount.toString()}
              />
              <div className="twelve columns mb-10">
                <label>Invoice Discount</label>
                <input
                  className="u-full-width"
                  type="number"
                  placeholder="Invoice Discount"
                  min={0}
                  max={100}
                  required
                  name="discountValue"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(parseInt(e.target.value));
                  }}
                />
              </div>
              <div className="twelve columns mb-10">
                <label>Final Amount</label>
                <input
                  className="u-full-width"
                  type="number"
                  placeholder="Final Amount"
                  name="finalAmount"
                  onChange={() => {}}
                  value={calculateDiscount(
                    totalAmount,
                    discountValue
                  ).toString()}
                />
              </div>
              <div className="twelve columns mb-10">
                <input type="hidden" name="cart" value={JSON.stringify(cart)} />
                <input
                  type="hidden"
                  name="quantity"
                  value={JSON.stringify(quantity)}
                />
              </div>
              <button type="submit" className="button-primary">
                Create Invoice
              </button>
            </div>
          </Form>
        </div>
      </>
    );
  }

  return (
    <div className="invoice-new">
      <HeaderComponent
        heading="Create Invoice"
        buttonText="Go back"
        to="/invoices"
      />
      {searchForm()}
      {showBill()}
      <div className="row">
        <div className="eight columns">
          <h5>Searched Products</h5>
        </div>
        <div className="four columns">
          <h5>Products In Cart</h5>
        </div>
      </div>
      <div className="row">
        <div className="eight columns">
          <table className="u-full-width">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Quantity Available</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderProducts()}</tbody>
          </table>
        </div>
        <div className="four columns">
          <table className="u-full-width">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price (PKR)</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>{renderCart()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
