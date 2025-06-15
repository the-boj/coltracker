// read a json file
import fs from "fs";
const data = fs.readFileSync("./data.json", "utf8");
const jsonData = JSON.parse(data);
const newData = jsonData.items
  .map((item) => ({
    id: item.id,
    name: item.name,
    status: "not-owned",
  }))
  .sort((a, b) => (a.name > b.name ? 1 : -1));
fs.writeFileSync("./new-data.json", JSON.stringify(newData, null, 2), "utf8");
