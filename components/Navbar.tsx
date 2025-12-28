"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Users } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            JobKhoj
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 hover:text-gray-900">
                <Briefcase className="w-4 h-4 mr-1" />
                Jobs
              </Button>
            </Link>
            <Link href="/internships">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 hover:text-gray-900">
                <Users className="w-4 h-4 mr-1" />
                Internships
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

