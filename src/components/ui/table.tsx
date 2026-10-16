import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<"table">>(({ className, ...props }, ref) => <table ref={ref} data-slot="table" className={cn("w-full border-collapse text-[12.5px]", className)} {...props} />);
Table.displayName = "Table";
export const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<"thead">>(({ className, ...props }, ref) => <thead ref={ref} data-slot="table-header" className={cn(className)} {...props} />);
TableHeader.displayName = "TableHeader";
export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<"tbody">>(({ className, ...props }, ref) => <tbody ref={ref} data-slot="table-body" className={cn(className)} {...props} />);
TableBody.displayName = "TableBody";
export const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<"tr">>(({ className, ...props }, ref) => <tr ref={ref} data-slot="table-row" className={cn(className)} {...props} />);
TableRow.displayName = "TableRow";
export const TableHead = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"th">>(({ className, ...props }, ref) => <th ref={ref} data-slot="table-head" className={cn("whitespace-nowrap border-0 border-b border-solid border-input px-2 py-[5px] text-center", className)} {...props} />);
TableHead.displayName = "TableHead";
export const TableCell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"td">>(({ className, ...props }, ref) => <td ref={ref} data-slot="table-cell" className={cn("whitespace-nowrap border-0 border-b border-solid border-input px-2 py-[5px] text-center", className)} {...props} />);
TableCell.displayName = "TableCell";
