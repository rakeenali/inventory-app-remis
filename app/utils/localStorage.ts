import { Product } from "@prisma/client";

export interface IData {
  product: Product;
  quantity: number;
}

export interface ILocalStorage {
  [k: number]: IData;
}

const key = "CART";

export const getData = (): ILocalStorage | null => {
  if (typeof window === "undefined") {
    console.log("we are not running on the client");
    return null;
  }
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as ILocalStorage;
  }
  return null;
};

export const setData = (datum: IData): ILocalStorage | null => {
  let data = getData();
  if (data) {
    data = { ...data, [datum.product.id]: datum };
  } else {
    data = { [datum.product.id]: datum };
  }
  localStorage.setItem(key, JSON.stringify(data));
  return data;
};
