import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";

const filePath = "database.json";

function readCategories() {
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  return parsed.categories || [];
}

export const getCategories = createServerFn({
  method: "GET",
}).handler(() => {
  return readCategories();
});
