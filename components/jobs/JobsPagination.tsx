"use client";

import { Pagination } from "@/components/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function JobsPagination(props: JobsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/jobs?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <Pagination {...props} onPageChange={handlePageChange} />;
}
