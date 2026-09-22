"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function JobsPagination({ currentPage, totalPages, totalItems, itemsPerPage }: JobsPaginationProps) {
  const pathname = usePathname() || "/jobs";
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  };

  const pageNumbers: Array<number | "ellipsis"> = [];
  if (totalPages <= 5) {
    for (let page = 1; page <= totalPages; page += 1) pageNumbers.push(page);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("ellipsis");
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
      pageNumbers.push(page);
    }
    if (currentPage < totalPages - 2) pageNumbers.push("ellipsis");
    pageNumbers.push(totalPages);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const linkClass = "inline-flex h-9 min-w-10 items-center justify-center gap-1 rounded-md border border-[#d6e5f7] bg-white px-3 text-sm font-semibold text-[#617493] hover:bg-[#eff7ff] hover:text-[#102e67]";

  return (
    <nav aria-label="Job results pagination" className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-[#617493]">
        Showing <strong className="text-[#102e67]">{startItem}</strong> to{" "}
        <strong className="text-[#102e67]">{endItem}</strong> of{" "}
        <strong className="text-[#102e67]">{totalItems}</strong> results
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <Link href={hrefFor(currentPage - 1)} rel="prev" className={linkClass}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-[#617493]" aria-hidden="true">…</span>
            ) : (
              <Link
                key={page}
                href={hrefFor(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`${linkClass} ${page === currentPage ? "border-primary bg-primary text-white" : ""}`}
              >
                {page}
              </Link>
            ),
          )}
        </div>
        {currentPage < totalPages && (
          <Link href={hrefFor(currentPage + 1)} rel="next" className={linkClass}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
