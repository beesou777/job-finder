import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative mb-8">
        <h1 className="text-[12rem] font-extrabold text-gray-100 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
             <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="w-12 h-12 text-[#0A66C2]" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
             <p className="text-gray-600 mt-2 max-w-xs">
                Oops! The page you're looking for doesn't exist or has been moved.
             </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button asChild variant="default" className="bg-[#0A66C2] hover:bg-[#004182] h-12 px-8 text-base font-semibold">
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 px-8 text-base font-semibold border-gray-300">
          <Link href="/remote-jobs" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Explore Remote Jobs
          </Link>
        </Button>
      </div>

      <div className="mt-12 text-sm text-gray-400">
        <p>If you think this is a mistake, please <Link href="/contact" className="underline hover:text-[#0A66C2]">contact support</Link>.</p>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
         <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[20%] left-[15%] w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}
