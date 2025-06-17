import { ColumnDef } from "@tanstack/react-table";
import { CategoryData } from "../api/types";
import { ModalType } from "../components/ModalInput";
import { Tooltip } from "@mui/material";

export function getColumns(
  categoryId: string,
  cellStyle: React.CSSProperties,
  setModalState: (state: ModalType) => void,
  columns?: string[]
): ColumnDef<CategoryData>[] {
  const baseColumns: ColumnDef<CategoryData>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div
          onClick={() =>
            setModalState({
              type: "name",
              text: "Update the item's name",
              category: categoryId,
              data: row.original,
            })
          }
          style={{ cursor: "pointer" }}
        >
          {row.original.name}
        </div>
      ),
      size: 600,
    },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: ({ row }) => (
        <div
          className="cell-table"
          onClick={() =>
            setModalState({
              type: "rating",
              text: "Your rating",
              category: categoryId,
              data: row.original,
            })
          }
          style={cellStyle}
        >
          {row.original.rating}
        </div>
      ),
      size: 80,
    },
    {
      header: "Condition",
      accessorKey: "condition",
      cell: ({ row }) => (
        <div
          className="cell-table"
          onClick={() =>
            setModalState({
              type: "condition",
              text: "The item's condition",
              category: categoryId,
              data: row.original,
            })
          }
          style={cellStyle}
        >
          {row.original.condition}
        </div>
      ),
      size: 80,
    },
  ];
  if (columns?.includes("owned")) {
    baseColumns.push({
      header: "Owned",
      accessorKey: "owned",
      cell: ({ row }) => (
        <div
          className="cell-table"
          onClick={() =>
            setModalState({
              type: "owned",
              text: "Owned items",
              category: categoryId,
              data: row.original,
            })
          }
          style={cellStyle}
        >
          {row.original.owned?.length}
        </div>
      ),
      size: 80,
    });
  }
  if (columns?.includes("total")) {
    baseColumns.push({
      header: "Total",
      accessorKey: "total",
      cell: ({ row }) => (
        <div
          className="cell-table"
          onClick={() =>
            setModalState({
              type: "total",
              text: "Total of items",
              category: categoryId,
              data: row.original,
            })
          }
          style={cellStyle}
        >
          {row.original.total}
        </div>
      ),
      size: 80,
    });
  }
  if (columns?.includes("price")) {
    console.log("YO");
    baseColumns.push({
      header: "Bought at",
      accessorKey: "boughtAt",
      cell: ({ row }) => (
        <div
          className="cell-table"
          onClick={() =>
            setModalState({
              type: "price",
              text: "Bougth at",
              data: row.original,
              category: categoryId,
            })
          }
          style={cellStyle}
        >
          {row.original.price}
        </div>
      ),
      size: 80,
    });
  }
  baseColumns.push({
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <Tooltip title={row.original.description} placement="top" arrow>
        <div
          className="cell-table"
          onClick={() =>
            setModalState({
              type: "description",
              text: "Some informations",
              data: row.original,
              category: categoryId,
            })
          }
          style={{
            ...cellStyle,
            border: "0px",
          }}
        >
          {row.original.description ? <div>i</div> : <div />}
        </div>
      </Tooltip>
    ),
    size: 80,
  });
  return baseColumns;
}
