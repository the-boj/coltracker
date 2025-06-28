import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { Category } from "./types";
import { filePath } from "./storage";

function readCategories() {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  return parsed.categories || [];
}

function putCategory(item: Category) {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  parsed.categories.push(item);
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf8");
}

export const getCategories = createServerFn({
  method: "GET",
}).handler(() => {
  return readCategories();
});

export const createCategory = createServerFn({
  method: "POST",
})
  .validator(
    (data: {
      category: Omit<Category, "image">;
      filename: string;
      image: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const decodedString = atob(data.image);
    const buffer = Buffer.from(decodedString, "binary");
    const fullPath = `./public/${data.filename}`;
    fs.writeFileSync(fullPath, buffer);

    const cateFull = {
      ...data.category,
      image: fullPath,
    };

    return putCategory(cateFull);
  });
