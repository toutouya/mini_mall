"use client";

import type { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string | number;
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
}

/** 通用数据表格 — 列定义 + 操作列 */
export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  actions,
  emptyMessage = "暂无数据",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 font-medium text-gray-500 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-right font-medium text-gray-500">操作</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyAccessor(row)}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.accessor(row)}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
