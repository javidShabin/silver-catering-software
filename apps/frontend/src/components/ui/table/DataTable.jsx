import React, { useState } from "react";
import { Search, Filter, Inbox } from "lucide-react";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
import TablePagination from "./TablePagination";
import Input from "../Input";

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  searchPlaceholder = "Search...",
  onSearch,
  filters = [],
  onFilter,
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  emptyMessage = "No data found",
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors shadow-sm shadow-slate-100/50">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-full max-w-[120px]"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <Inbox className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">{emptyMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Real Data
              data.map((row, rowIdx) => (
                <TableRow key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={col.cellClassName}>
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && data.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </TableContainer>
    </div>
  );
};

export default DataTable;
