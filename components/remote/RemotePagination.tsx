"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";

interface RemotePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function RemotePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: RemotePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/remote-jobs?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
