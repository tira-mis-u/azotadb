'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "Không có dữ liệu",
  onRowClick,
  pagination
}: DataTableProps<T>) {
  return (
    <div className="w-full transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border rounded-none">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-card">
                  {columns.map((_, idx) => (
                    <td key={idx} className="px-8 py-6">
                      <div className="h-4 bg-muted rounded-xl w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item, rowIdx) => (
                <motion.tr
                  key={rowIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  className="group hover:bg-muted/50 transition-all cursor-pointer relative"
                >
                  {columns.map((column, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-xs font-bold text-foreground">
                      <div className="transition-transform group-hover:translate-x-1 duration-200">
                        {column.cell ? column.cell(item) : (item as any)[column.accessorKey as string]}
                      </div>
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-8 py-20 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                       <Filter className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-8 py-5 border-t border-border flex items-center justify-between bg-muted/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            TRANG <span className="text-primary font-black">{pagination.currentPage}</span> / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: ChevronsLeft, onClick: () => pagination.onPageChange(1), disabled: pagination.currentPage === 1 },
              { icon: ChevronLeft, onClick: () => pagination.onPageChange(pagination.currentPage - 1), disabled: pagination.currentPage === 1 },
              { icon: ChevronRight, onClick: () => pagination.onPageChange(pagination.currentPage + 1), disabled: pagination.currentPage === pagination.totalPages },
              { icon: ChevronsRight, onClick: () => pagination.onPageChange(pagination.totalPages), disabled: pagination.currentPage === pagination.totalPages }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 transition-all shadow-sm"
              >
                <btn.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
