"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";

interface LinkedInPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function LinkedInPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: LinkedInPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsSnapshot = searchParams ?? new URLSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(paramsSnapshot.toString());
    params.set("page", String(page));
    router.push(`/linkedin-jobs?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
    />
  );
}
