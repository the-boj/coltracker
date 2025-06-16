import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { Category, CategoryData } from "./types";

const filePath = "database.json";

export function readElements(categoryId: string): CategoryData[] {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  return parsed[categoryId] || [];
}

function readCategory(categoryId: string): Category | undefined {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  return parsed.categories.find((category) => category.id === categoryId);
}

function patchGame(category: string, newItem: CategoryData): void {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  const newCate = parsed[category].map((item: CategoryData) => {
    if (item.id === newItem.id) {
      return newItem;
    }
    return item;
  });
  parsed[category] = newCate;
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf8");
}

function addGame(category: string, newItem: CategoryData): void {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  const dataCate = parsed[category] || [];
  dataCate.push(newItem);
  const dataCateSorted = dataCate.sort((a: CategoryData, b: CategoryData) =>
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  );
  parsed[category] = dataCateSorted;
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf8");
}

export const getElements = createServerFn({
  method: "GET",
})
  .validator((data: string) => {
    if (typeof data !== "string") {
      throw new Error("Invalid category ID");
    }
    return data;
  })
  .handler((ctx) => {
    return readElements(ctx.data);
  });

export const getElementsAndCategory = createServerFn({
  method: "GET",
})
  .validator((data: string) => {
    if (typeof data !== "string") {
      throw new Error("Invalid category ID");
    }
    return data;
  })
  .handler((ctx) => {
    const elements = readElements(ctx.data);
    const category = readCategory(ctx.data);
    return { elements, category };
  });

export const updateElement = createServerFn({
  method: "POST",
})
  .validator((data: { category: string; item: CategoryData }) => {
    return data;
  })
  .handler((ctx) => {
    return patchGame(ctx.data.category, ctx.data.item);
  });

export const addElement = createServerFn({
  method: "POST",
})
  .validator((data: { category: string; item: CategoryData }) => {
    return data;
  })
  .handler((ctx) => {
    return addGame(ctx.data.category, ctx.data.item);
  });
