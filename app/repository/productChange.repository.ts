import { ProductChange } from "@prisma/client";
import { IProductChange } from "~/types";
import { db } from "./db.server";

export const getProductChangeByProductId = async (
  productId: number
): Promise<ProductChange[]> => {
  try {
    const productChange = await db.productChange.findMany({
      where: { product_id: productId },
    });

    return productChange;
  } catch (error) {
    console.log("Repo -> updateQuantity", error);
    throw error;
  }
};

export const createProductChange = async (data: IProductChange) => {
  try {
    const productChange = await db.productChange.create({
      data,
    });

    return productChange;
  } catch (error) {
    console.log("Repo -> createProductChange", error);
    throw error;
  }
};
