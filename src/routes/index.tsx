import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getCategories } from "../api/categories";
import { Grid } from "@mui/material";
import { Category } from "../api/types";
import "./index.css";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => getCategories(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <Grid container spacing={2} padding={2}>
      {state.map((category: Category) => (
        <Grid key={category.id} size={{ xs: 3, md: 4 }}>
          <div
            className="category-item"
            onClick={() =>
              router.navigate({ to: `/categories/${category.id}` })
            }
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
            />
          </div>
        </Grid>
      ))}
    </Grid>
  );
}
