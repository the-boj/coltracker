import React, { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  deleteElement,
  getElements,
  getElementsAndCategory,
} from "../api/elements";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import ModalInput, { ModalType } from "../components/ModalInput";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@mui/material";
import ModalAdd from "../components/ModalAdd";
import { getColumns } from "../utils/columns";
import { CategoryData } from "../api/types";

function getBackgroundColor(row: Row<CategoryData>) {
  if ("total" in row.original) {
    if (row.original.owned?.length === row.original.total) {
      return "green";
    } else if (row.original.owned?.length || 0 > 0) {
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

function getTextColor(row: Row<CategoryData>) {
  const background = getBackgroundColor(row);
  if (background === "white") {
    return "black";
  }
  return "white";
}

export const Route = createFileRoute("/categories/$categoryId")({
  component: Elements,
  loader: async ({ params }) =>
    getElementsAndCategory({ data: params.categoryId }),
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
  const { elements: elementsFetched, category: categoryFetched } =
    Route.useLoaderData();
  const [modalState, setModalState] = useState<ModalType | undefined>();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState<string | undefined>();
  const [elementsState, setElementsState] = useState(elementsFetched);

  const router = useRouter();

  const refetchElements = () => {
    getElements({
      data: categoryId,
    }).then((data) => {
      setElementsState(data);
    });
  };

  const deleteRow = (id: string) => {
    deleteElement({
      data: { category: categoryId, id },
    }).then(() => {
      setElementsState((prev) => prev.filter((element) => element.id !== id));
    });
  };

  const elements = useMemo(() => {
    return elementsState.filter((element) =>
      element.name.toLowerCase().includes(search?.toLowerCase() || "")
    );
  }, [search, elementsState]);

  const totalPaid = useMemo(() => {
    return elements.reduce((total, element) => {
      if ("price" in element && element.price) {
        return total + element.price;
      }
      return total;
    }, 0);
  }, [elements]);

  const columns = React.useMemo<ColumnDef<CategoryData>[]>(
    () =>
      getColumns(
        categoryId,
        cellStyle,
        setModalState,
        categoryFetched?.columns
      ),
    []
  );

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
      <ModalAdd
        category={categoryFetched}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onValidate={refetchElements}
      />
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
        <div
          style={{
            margin: "7px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "22px",
          }}
        >
          {categoryFetched?.name}
        </div>
        <Input
          style={{ border: "1px solid grey", marginBottom: "10px" }}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <div
          style={{
            margin: "9px",
            marginLeft: "auto",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "18px",
          }}
          onClick={() => setIsAddOpen(true)}
        >
          Add
        </div>
        {totalPaid > 0 && (
          <div style={{ margin: "10px" }}>Total spent : {totalPaid}</div>
        )}
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
              const row = rows[virtualRow.index] as Row<CategoryData>;
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  className="hover-row"
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
                  <td
                    className="edit-delete"
                    style={{
                      marginRight: "20px",
                      marginLeft: "auto",
                      cursor: "pointer",
                    }}
                    onClick={() => deleteRow(row.original.id)}
                  >
                    Delete
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
