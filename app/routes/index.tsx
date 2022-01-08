import { Link } from "remix";

export default function Index() {
  return (
    <>
      <h1>Welcome to Inventory</h1>
      <hr />
      <div className="row">
        <div className="two columns">
          <Link className="button button-primary" to="/inventory">
            Inventory
          </Link>
        </div>
        <div className="eight columns">&nbsp;</div>
        <div className="two columns">
          <Link className="button button-primary" to="/">
            Invoices
          </Link>
        </div>
      </div>
    </>
  );
}
