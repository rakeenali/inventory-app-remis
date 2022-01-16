import {
  ActionFunction,
  LoaderFunction,
  useActionData,
  useLoaderData,
} from "remix";
import PHE from "print-html-element";

import { HeaderComponent } from "~/components/Header.component";
import { getInvoice, printInvoice } from "~/repository/invoices.repository";
import { IInvoice } from "~/types/invoice";
import { formatDate, integerCheck } from "~/utils";
import { useEffect } from "react";

export const loader: LoaderFunction = async ({ params, request }) => {
  const { id } = params;

  if (id && integerCheck(id)) {
    const invoice = await getInvoice(Number(id));
    if (invoice) {
      return {
        invoice,
      };
    }
  }

  throw new Response("Not Found", { status: 404 });
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_print") == "print") {
    const { id } = params;
    if (id && integerCheck(id)) {
      const invoice = await getInvoice(Number(id));
      if (invoice) {
        const template = await printInvoice(invoice);
        return { template: template };
      }
    }
  } else {
    return { template: "" };
  }
};

type LoaderProps = {
  invoice: IInvoice;
};

export default function InvoiceDetails() {
  const { invoice } = useLoaderData<LoaderProps>();
  const data = useActionData();

  useEffect(() => {
    if (data?.template) {
      //@ts-ignore
      PHE.printHtml(data?.template);
    }
  }, []);

  const renderCard = (label: string, value: number, suffix: string) => {
    return (
      <div className="three columns">
        <div className="invoice-card">
          <p>
            <strong>{label}</strong>
          </p>
          <h5>
            {value} <span>({suffix})</span>
          </h5>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    if (invoice?.InvoiceProducts && invoice.InvoiceProducts.length > 0) {
      return invoice.InvoiceProducts.map((ip, idx) => {
        return (
          <>
            <tr key={ip.id + "invoice-products"}>
              <td>{idx + 1}</td>
              <td>{ip.product?.name.substr(0, 20)}</td>
              <td>{ip.actual_price}</td>
              <td>{ip.quantity}</td>
              <td>{ip.final_price}</td>
            </tr>
          </>
        );
      });
    }
  };

  return (
    <>
      <HeaderComponent
        heading={`Details: ${invoice.name}`}
        to="/invoices"
        buttonText="Go Back"
      />
      <hr />
      <div className="row">
        {renderCard("Product Quantity: ", invoice.product_quantity, "QTY")}
        {renderCard("Amount: ", invoice.amount, "PKR")}
        {renderCard("Discount: ", invoice.discount, "%")}
        {renderCard("Final Price: ", invoice.final_amount, "PKR")}
        <div className="twelve columns mt-20">
          <p>
            Invoice Created At:{" "}
            <strong>{formatDate(invoice.created_at || new Date())}</strong>
          </p>
        </div>
      </div>
      <div className="row">
        <div className="six columns">
          <h4 className="mt-20 mb-10">
            Products in Invoice:{" "}
            <strong>({invoice.InvoiceProducts?.length || 0})</strong>
          </h4>
        </div>
        <div className="three columns">&nbsp;</div>
        <form className="three columns" method="post">
          <input type="hidden" name="_print" value="print" />
          <button className="button-primary u-full-width">Print</button>
        </form>
      </div>
      <table className="u-full-width">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Actual Price (PKR)</th>
            <th>Quantity</th>
            <th>Final Price (PKR)</th>
          </tr>
        </thead>
        <tbody>{renderProducts()}</tbody>
      </table>
    </>
  );
}
