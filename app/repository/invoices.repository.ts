import { InvoiceProducts, Invoices } from "@prisma/client";
import * as ejs from "ejs";
import PHE from "print-html-element";

import {
  ICreateInvoice,
  ICreateInvoiceProduct,
  IInvoice,
  IInvoiceEjs,
} from "~/types/invoice";
import { formatDate } from "~/utils";
import { invoiceEjs } from "~/utils/invoice";
import { db } from "./db.server";
import { updateQuantity } from "./products.repository";

export const getInvoices = async (): Promise<Invoices[]> => {
  try {
    const invoices = await db.invoices.findMany({
      orderBy: { created_at: "desc" },
      where: { deleted: false },
    });

    return invoices;
  } catch (error) {
    console.log("Repo -> getInvoices", error);
    throw error;
  }
};

export const searchInvoices = async (
  searchTerm: string
): Promise<Invoices[]> => {
  try {
    let isNumber = Number.isInteger(Number(searchTerm));
    let invoices: Invoices[] = [];

    if (isNumber) {
      invoices = await db.invoices.findMany({
        where: {
          id: Number(searchTerm),
          deleted: false,
        },
      });
    } else {
      invoices = await db.invoices.findMany({
        where: {
          name: { contains: searchTerm },
          deleted: false,
        },
        orderBy: { created_at: "desc" },
      });
    }

    return invoices;
  } catch (error) {
    console.log("Repo -> searchProducts", error);
    throw error;
  }
};

export const getInvoice = async (id: number) => {
  try {
    let isNumber = Number.isInteger(Number(id));

    if (!isNumber) {
      return null;
    }

    const invoice = await db.invoices.findFirst({
      where: {
        id: id,
        deleted: false,
      },
      include: {
        InvoiceProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    return invoice;
  } catch (error) {
    console.log("Repo -> searchProducts", error);
    throw error;
  }
};

// Mutations

export const createInvoice = async (
  args: ICreateInvoice
): Promise<Invoices> => {
  try {
    // Create invoice.
    const invoice = await db.invoices.create({
      data: {
        amount: args.invoiceAmount,
        final_amount: args.finalAmount,
        discount: args.discountValue,
        name: args.invoiceName,
        product_quantity: args.products.length,
      },
    });

    // Add in invoice products
    const productInvoice = await createInvoicesProducts(
      args.products.map((p) => ({
        invoiceId: invoice.id,
        productId: p.id,
        quantity: p.quantity,
        actualPrice: p.final_price,
      }))
    );

    for (let product of args.products) {
      await updateQuantity({
        id: product.id,
        quantity: product.quantity,
        operation: "REMOVE",
      });
    }

    return invoice;
  } catch (error) {
    console.log("Repo -> createInvoice", error);
    throw error;
  }
};

export const createInvoicesProducts = async (
  args: ICreateInvoiceProduct[]
): Promise<InvoiceProducts[]> => {
  try {
    let invoiceProducts: InvoiceProducts[] = [];
    for (let idx in args) {
      invoiceProducts[idx] = await db.invoiceProducts.create({
        data: {
          invoice_id: args[idx].invoiceId,
          product_id: args[idx].productId,
          actual_price: args[idx].actualPrice,
          quantity: args[idx].quantity,
          final_price: args[idx].actualPrice * args[idx].quantity,
        },
      });
    }

    return invoiceProducts;
  } catch (error) {
    console.log("Repo -> createInvoicesProducts", error);
    throw error;
  }
};

export const printInvoice = async (invoice: IInvoice) => {
  const data: IInvoiceEjs = {
    invoiceAmount: invoice.final_amount.toFixed(2).toString() || "",
    invoiceSubtotal: invoice.amount.toFixed(2).toString() || "",
    invoiceDate: formatDate(invoice.created_at || new Date()),
    invoiceDiscount: invoice.discount.toFixed(2).toString() || "",
    invoiceId: invoice.id?.toString() || "",
    invoiceName: invoice.name,
    product: invoice?.InvoiceProducts?.map((p) => {
      return {
        actualPrice: p.actual_price.toFixed(2).toString() || "",
        finalPrice: p.final_price.toFixed(2).toString() || "",
        name: p?.product?.name,
        quantity: p.quantity.toString() || "",
      };
    }) as any,
  };

  const renderedInvoice = ejs.render(invoiceEjs, data);
  return renderedInvoice;
};
