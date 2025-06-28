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

function folderExists(): boolean {
  try {
    fs.accessSync("/app/data/public", fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function createFolder(): void {
  fs.mkdirSync("/app/data/public", { recursive: true });
}

export const checkFileExistence = createServerFn({
  method: "GET",
}).handler((ctx) => {
  const exists = fileExists();
  if (!exists) {
    createFile();
  }
  const folderExistsResult = folderExists();
  if (!folderExistsResult) {
    createFolder();
  }
});
