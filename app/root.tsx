import { Outlet, LiveReload, Link, Links, Meta, Scripts } from "remix";

import normalizeStylesUrl from "~/styles/normalize.css";
import skeletonStyleUrl from "~/styles/skeleton.css";
import globalStylesUrl from "~/styles/global.css";

export const links = () => [
  { rel: "stylesheet", href: normalizeStylesUrl },
  { rel: "stylesheet", href: skeletonStyleUrl },
  { rel: "stylesheet", href: globalStylesUrl },
];

export const meta = () => {
  const description = "Inventory App";
  const keywords = "inventory, remix";

  return {
    description,
    keywords,
  };
};

type Props = {
  children?: React.ReactNode;
  title?: string;
};

function Document({ children = null, title = "" }: Props): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>{title ? title : "Remix Blog"}</title>
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
}

function Layout({ children }: Props): JSX.Element {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          INVENTORY
        </Link>

        <ul className="nav">
          <li>
            <Link to="/inventory">Inventory</Link>
          </li>
          <li>
            <Link to="/invoices">Invoices</Link>
          </li>
        </ul>
      </nav>
      <div className="container">{children}</div>
      <div id="toPrint"></div>
    </>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  console.log(error);
  return (
    <Document>
      <Layout>
        <h1>Error</h1>
        <p>{error.message}</p>
      </Layout>
    </Document>
  );
}

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
        <Scripts />
      </Layout>
    </Document>
  );
}
