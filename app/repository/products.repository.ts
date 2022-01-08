import type { Product as ProductPrisma } from "@prisma/client";
import { IUpdateQuantity, Product } from "~/types";
import { createSku } from "~/utils";
import { db } from "./db.server";
import { createProductChange } from "./productChange.repository";

export const getAllProducts = async (): Promise<ProductPrisma[]> => {
  try {
    const products = await db.product.findMany({
      where: { deleted: false },
      orderBy: { created_at: "desc" },
    });

    return products;
  } catch (error) {
    console.log("Repo -> getAllProducts", error);
    throw error;
  }
};

export const searchProducts = async (
  searchTerm: string
): Promise<ProductPrisma[]> => {
  try {
    let isNumber = Number.isInteger(Number(searchTerm));
    let products: ProductPrisma[] = [];

    if (isNumber) {
      products = await db.product.findMany({
        where: {
          id: Number(searchTerm),
          deleted: false,
        },
      });
    } else {
      products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { barcode: { contains: searchTerm } },
          ],
          AND: [{ deleted: false }],
        },
        orderBy: { created_at: "desc" },
      });
    }

    return products;
  } catch (error) {
    console.log("Repo -> searchProducts", error);
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await db.product.update({
      where: { id },
      data: { deleted: true },
    });
  } catch (error) {
    console.log("Repo -> deleteProduct", error);
    throw error;
  }
};

export const createProduct = async (data: Product): Promise<ProductPrisma> => {
  try {
    const newProduct = await db.product.create({
      data: {
        ...data,
        quantity: data.quantity || 0,
        sku: createSku(data.name),
      },
    });

    await createProductChange({
      previous_quantity: 0,
      updated_quantity: data.quantity || 0,
      product_id: newProduct.id,
    });

    return newProduct;
  } catch (error) {
    console.log("Repo -> createProduct", error);
    throw error;
  }
};

export const updateProduct = async (data: Product): Promise<ProductPrisma> => {
  try {
    const newProduct = await db.product.update({
      where: { id: data.id },
      data: data,
    });

    return newProduct;
  } catch (error) {
    console.log("Repo -> updateProduct", error);
    throw error;
  }
};

export const updateQuantity = async (args: IUpdateQuantity) => {
  try {
    const product = await db.product.findUnique({ where: { id: args.id } });

    if (!product) {
      throw new Error("Invalid product id");
    }

    let newQuantity = product.quantity;
    if (args.operation === "REMOVE") {
      newQuantity -= args.quantity;
    } else {
      newQuantity += args.quantity;
    }

    await db.product.update({
      where: { id: args.id },
      data: { quantity: newQuantity },
    });

    await createProductChange({
      previous_quantity: product.quantity,
      updated_quantity: newQuantity,
      product_id: product.id,
    });
  } catch (error) {
    console.log("Repo -> updateQuantity", error);
    throw error;
  }
};
