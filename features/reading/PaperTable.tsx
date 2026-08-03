"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
  TableSortLabel,
} from "@mui/material";
import { Paper, ReadingStatus } from "@/types";
import { formatDate } from "@/utils/date";

const statusColor: Record<ReadingStatus, string> = {
  "To Read": "#8FB2C9",
  Reading: "#E0B15C",
  Read: "#7FB77E",
  Reference: "#B39DDB",
};

const columnHelper = createColumnHelper<Paper>();

export function PaperTable({ papers, onRowClick }: { papers: Paper[]; onRowClick: (p: Paper) => void }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", { header: "Title" }),
      columnHelper.accessor((row) => row.authors.join(", "), { id: "authors", header: "Authors" }),
      columnHelper.accessor("category", { header: "Category" }),
      columnHelper.accessor("difficulty", { header: "Difficulty" }),
      columnHelper.accessor("status", { header: "Status" }),
      columnHelper.accessor("hoursRead", { header: "Hours" }),
      columnHelper.accessor("updatedAt", { header: "Updated", cell: (info) => formatDate(info.getValue()) }),
    ],
    []
  );

  const table = useReactTable({
    data: papers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Box sx={{ overflowX: "auto", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableCell key={header.id} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={!!header.column.getIsSorted()}
                    direction={header.column.getIsSorted() === "asc" ? "asc" : "desc"}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              onClick={() => onRowClick(row.original)}
              sx={{ cursor: "pointer" }}
            >
              {row.getVisibleCells().map((cell) => {
                if (cell.column.id === "status") {
                  return (
                    <TableCell key={cell.id}>
                      <Chip
                        label={row.original.status}
                        size="small"
                        sx={{
                          bgcolor: `${statusColor[row.original.status]}22`,
                          color: statusColor[row.original.status],
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={cell.id} sx={{ maxWidth: 260 }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
