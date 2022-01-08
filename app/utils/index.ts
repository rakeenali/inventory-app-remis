import { format } from "date-fns";
import slugify from "slugify";

export const createSku = (name: string) => {
  return (
    slugify(name, { lower: true }) + "-" + Math.random().toString(36).substr(9)
  );
};

export const integerCheck = (value: string): boolean => {
  return Number.isInteger(Number(value || ""));
};

export const formatDate = (date: Date) => {
  return format(new Date(date), "hh:mm aaa / dd MMM y");
};
