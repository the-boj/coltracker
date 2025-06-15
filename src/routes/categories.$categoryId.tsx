import React, { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getElements } from "../api/elements";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { Game, Manga } from "../api/types";
import ModalInput, { ModalType } from "../components/ModalInput";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@mui/material";

function getBackgroundColor(row: Row<Game | Manga>) {
  if ("total" in row.original) {
    if (row.original.owned.length === row.original.total) {
      return "green";
    } else if (row.original.owned.length > 0) {
      return "yellow";
    }
    return "white";
  } else {
    if (row.original.status === "owned") {
      return "green";
    }
    return "white";
  }
}

function getTextColor(row: Row<Game | Manga>) {
  const background = getBackgroundColor(row);
  if (background === "white") {
    return "black";
  }
  return "white";
}

export const Route = createFileRoute("/categories/$categoryId")({
  component: Elements,
  loader: async ({ params }) => getElements({ data: params.categoryId }),
});

const cellStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "1px solid grey",
  width: "100%",
  height: "30px",
};

function Elements() {
  const { categoryId } = Route.useParams();
  const dataState = Route.useLoaderData() as (Game | Manga)[];
  const [modalState, setModalState] = useState<ModalType | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [elementsState, setElementsState] = useState(dataState);

  const router = useRouter();

  const refetchElements = () => {
    getElements({
      data: categoryId,
    }).then((data) => {
      setElementsState(data as (Game | Manga)[]);
    });
  };

  const elements = useMemo(() => {
    return elementsState.filter((element) =>
      element.name.toLowerCase().includes(search?.toLowerCase() || "")
    );
  }, [search, elementsState]);

  const columns = React.useMemo<ColumnDef<Game | Manga>[]>(() => {
    const baseColumns: ColumnDef<Game | Manga>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => row.original.name,
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
                data: row.original as Game,
              })
            }
            style={cellStyle}
          >
            {row.original.rating}
          </div>
        ),
        size: 80,
      },
    ];
    const isManga = elements.length > 0 && "total" in elements[0];
    if (isManga) {
      baseColumns.push({
        header: "Owned",
        accessorKey: "owned",
        cell: ({ row }) => (row.original as Manga).owned,
      });
      baseColumns.push({
        header: "Total",
        accessorKey: "total",
        cell: ({ row }) => (row.original as Manga).total,
      });
    }
    if (!isManga) {
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
                game: row.original as Game,
                category: categoryId,
              })
            }
            style={cellStyle}
          >
            {(row.original as Game).price}
          </div>
        ),
        size: 80,
      });
    }
    return baseColumns;
  }, []);

  // The virtualizer will need a reference to the scrollable container element
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data: elements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 20,
  });

  return (
    <div>
      <ModalInput
        state={modalState}
        onClose={() => setModalState(undefined)}
        onValidate={refetchElements}
      />
      <div style={{ display: "flex" }}>
        <div
          style={{
            margin: "10px",
            cursor: "pointer",
          }}
          onClick={() => router.navigate({ to: "/" })}
        >
          Home
        </div>
        <Input
          style={{ border: "1px solid grey", marginBottom: "10px" }}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </div>
      <div
        ref={tableContainerRef}
        style={{
          overflow: "auto", //our scrollable table container
          position: "relative", //needed for sticky header
          height: "90vh", //should be a fixed height
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: "grid", width: "98%" }}>
          <thead
            style={{
              display: "grid",
              position: "sticky",
              paddingLeft: "10px",
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ display: "flex", width: "100%" }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: "flex",
                        width: header.getSize(),
                      }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              display: "grid",
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: "relative", //needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<Game | Manga>;
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  style={{
                    backgroundColor: getBackgroundColor(row),
                    color: getTextColor(row),
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll,
                    height: "35px",
                    width: "100%",
                    alignItems: "center",
                    paddingLeft: "10px",
                    border: "0.5px solid lightgrey",
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          display: "flex",
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
