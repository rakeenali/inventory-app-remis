import { Invoices } from "@prisma/client";
import { LoaderFunction, useLoaderData, Link } from "remix";
import { HeaderComponent } from "~/components/Header.component";
import { getInvoices } from "~/repository/invoices.repository";
import { formatDate } from "~/utils";

export const loader: LoaderFunction = async () => {
  const invoices = await getInvoices();

  return { invoices };
};

type LoaderProps = {
  invoices: Invoices[];
};

export default function InvoiceIndex() {
  const { invoices } = useLoaderData<LoaderProps>();

  const renderInvoices = () => {
    return invoices.map((invoice) => {
      return (
        <>
          <tr key={invoice.id + "invoices"}>
            <td>{invoice.id}</td>
            <td>
              <Link to={`details/${invoice.id}`}>{invoice.name}</Link>
            </td>
            <td>{invoice.product_quantity}</td>
            <td>{invoice.amount}</td>
            <td>{invoice.discount}</td>
            <td>{invoice.final_amount}</td>
            <td>{formatDate(invoice.created_at)}</td>
          </tr>
        </>
      );
    });
  };

  return (
    <>
      <HeaderComponent heading="Invoices" to="new" buttonText="New Invoice" />
      <hr />
      <table className="u-full-width">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Total Products</th>
            <th>Amount (PKR)</th>
            <th>Discount (%)</th>
            <th>Final Amount (PKR)</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>{renderInvoices()}</tbody>
      </table>
    </>
  );
}
