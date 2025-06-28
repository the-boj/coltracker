import { createServerFn } from "@tanstack/react-start";
import * as fs from "node:fs";

export const filePath = "/app/data/database.json";

function fileExists(): boolean {
  try {
    fs.readFileSync(filePath, "utf8");
    return true;
  } catch (error) {
    return false;
  }
}

function createFile(): void {
  fs.writeFileSync(
    filePath,
    JSON.stringify({ categories: [] }, null, 2),
    "utf8"
  );
}

export const checkFileExistence = createServerFn({
  method: "GET",
}).handler((ctx) => {
  const exists = fileExists();
  if (!exists) {
    createFile();
  }
});
