import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { Game, Manga } from "./types";

const filePath = "database.json";

function readElements(categoryId: string): (Game | Manga)[] {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  return parsed[categoryId] || [];
}

function patchGame(category: string, newItem: Game | Manga): void {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  const newCate = parsed[category].map((item: Game | Manga) => {
    if (item.id === newItem.id) {
      return newItem;
    }
    return item;
  });
  parsed[category] = newCate;
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

export const updateElement = createServerFn({
  method: "POST",
})
  .validator((data: { category: string; item: Game | Manga }) => {
    return data;
  })
  .handler((ctx) => {
    return patchGame(ctx.data.category, ctx.data.item);
  });
