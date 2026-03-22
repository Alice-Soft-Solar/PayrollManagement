"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpZA, ChevronsLeft, ChevronsRight } from "lucide-react";

import { PAGE_SIZE } from "@/lib/constants";
import { EmptyState } from "@/components/ui/EmptyState";

export interface ColumnDef<T> {
  id?: string;
  key: keyof T;
  header: string;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
}

export const DataTable = <T extends object>({
  columns,
  data,
  pageSize = PAGE_SIZE,
}: DataTableProps<T>) => {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data;
    }

    return [...data].sort((a, b) => {
      const left = String(a[sortKey] ?? "").toLowerCase();
      const right = String(b[sortKey] ?? "").toLowerCase();

      if (left < right) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (left > right) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginated = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  if (!data.length) {
    return (
      <EmptyState
        title="No records"
        description="No data available for this view yet."
      />
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <th
                key={`${column.id ?? String(column.key)}-${columnIndex}`}
                className={`table-align-${column.align ?? "left"}`}
              >
                <button
                  className="table-sort"
                  onClick={() => toggleSort(column.key)}
                >
                  {column.header}
                  {sortKey === column.key ? (
                    sortDirection === "asc" ? (
                      <ArrowDownAZ size={14} />
                    ) : (
                      <ArrowUpZA size={14} />
                    )
                  ) : null}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, index) => (
            <tr key={index}>
              {columns.map((column, columnIndex) => (
                <td
                  key={`${column.id ?? String(column.key)}-${columnIndex}`}
                  className={`table-align-${column.align ?? "left"}`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-pagination">
        <button
          className="icon-button"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          <ChevronsLeft size={16} />
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="icon-button"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
