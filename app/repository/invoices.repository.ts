import { Invoices } from "@prisma/client";
import { db } from "./db.server";

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
