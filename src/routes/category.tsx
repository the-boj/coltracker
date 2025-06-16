import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Input,
} from "@mui/material";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Category } from "../api/types";
import { useState } from "react";
import { fileToBase64 } from "../utils/files";
import { createCategory } from "../api/categories";

export const Route = createFileRoute("/category")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File>();
  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  async function addCategory(e) {
    e.preventDefault();

    if (!selectedFile) {
      return;
    }

    const columns: string[] = [];

    const formData = new FormData(e.target);
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const total = formData.get("total") as string;
    const owned = formData.get("owned") as string;

    if (price) {
      columns.push("price");
    }
    if (total) {
      columns.push("total");
    }
    if (owned) {
      columns.push("owned");
    }

    const buffer = await fileToBase64(selectedFile);

    const cate: Omit<Category, "image"> = {
      id: crypto.randomUUID(),
      name,
      columns,
    };

    createCategory({
      data: { category: cate, filename: selectedFile.name, image: buffer },
    }).then(() => {
      router.navigate({ to: "/" });
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex" }}>
        <div
          style={{
            margin: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => router.navigate({ to: "/" })}
        >
          Home
        </div>
      </div>
      <form onSubmit={addCategory}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "90vh",
          }}
        >
          <Input
            required
            name="name"
            placeholder="name"
            style={{ width: "300px" }}
          />
          <Input
            type="file"
            name="image"
            style={{ marginTop: "20px" }}
            onChange={onFileChange}
          />
          <FormGroup style={{ marginTop: "20px" }} onSubmit={addCategory}>
            <FormControlLabel
              name="price"
              control={<Checkbox />}
              label="price"
            />
            <FormControlLabel
              name="total"
              control={<Checkbox />}
              label="total"
            />
            <FormControlLabel
              name="owned"
              control={<Checkbox />}
              label="owned"
            />
          </FormGroup>
          <Button style={{ marginTop: "20px" }} type="submit">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
