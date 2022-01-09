import * as casual from "casual";
import slugify from "slugify";
import { PrismaClient } from "@prisma/client";
import { Product } from "~/types";
import { calculateDiscount } from "~/utils";

const db = new PrismaClient();

async function seed() {
  await insertProducts();
  await insertProductChange();
  await createInvoice();
}

async function deleteAll() {
  await db.invoiceProducts.deleteMany();
  await db.productChange.deleteMany();
  await db.product.deleteMany();
  await db.invoices.deleteMany();

  console.log("Data deleted");
}

const createProduct = (): Product => {
  const name = casual.title;
  const price = casual.integer(100, 1000);
  const slug =
    slugify(name, { lower: true }) + "-" + Math.random().toString(36).substr(9);

  const product: Product = {
    name: name,
    sku: slug,
    barcode: casual.password,
    price: price,
    quantity: casual.integer(10, 100),
    final_price: price + casual.integer(10, 100),
    deleted: false,
  };

  return product;
};

seed();
// deleteAll();

async function insertProducts() {
  for (let i = 0; i <= 500; i++) {
    const product = createProduct();
    // @ts-ignore
    await db.product.create({ data: product });
    console.log("Product added: ", i + 1);
  }
}

async function insertProductChange() {
  const products = await db.product.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
  });

  const operationType = ["ADD", "REMOVE"];
  for (let product of products) {
    let originalQty = product.quantity;
    for (let i = 0; i < casual.integer(1, 15); i++) {
      const operation = operationType[casual.integer(0, 1)];
      let newQty = 0;

      if (operation === "ADD") {
        newQty = originalQty + casual.integer(1, originalQty - 3);
      } else {
        newQty = originalQty - casual.integer(1, originalQty - 3);
      }

      await db.productChange.create({
        data: {
          previous_quantity: originalQty,
          updated_quantity: newQty,
          product_id: product.id,
        },
      });

      originalQty = newQty;
    }
    await db.product.update({
      where: { id: product.id },
      data: { quantity: originalQty },
    });
  }
}

async function createInvoice() {
  for (let i = 0; i < 101; i++) {
    const products = await db.product.findMany({
      take: casual.integer(5, 10),
      skip: casual.integer(1, 450),
      orderBy: { created_at: "desc" },
    });

    const totalAmount = products.reduce((acc, p) => {
      return acc + p.final_price;
    }, 0);
    const discount = casual.integer(0, 50);
    const newInvoice = await db.invoices.create({
      data: {
        name: casual.title,
        amount: totalAmount,
        discount: discount,
        final_amount: calculateDiscount(totalAmount, discount),
        product_quantity: products.length,
      },
    });

    for (let product of products) {
      await db.invoiceProducts.create({
        data: {
          invoice_id: newInvoice.id,
          product_id: product.id,
          actual_price: product.final_price,
          quantity: 1,
          final_price: product.final_price,
        },
      });
    }
  }
}
