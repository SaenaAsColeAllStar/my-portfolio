import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] text-black px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertCircle className="h-10 w-10 text-[#0070F3]" />
        <h1 className="font-display font-medium text-2xl tracking-tight">System Node Not Found</h1>
        <p className="text-xs text-gray-500 font-mono">ERROR_CODE: PATH_NOT_RESOLVED_404</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          The structural coordinate you are attempting to trace does not exist in Cole&apos;s active workspace.
        </p>
        <Link 
          href="/" 
          className="mt-6 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-mono rounded-full shadow-sm transition-all"
        >
          RETURN_TO_BASE
        </Link>
      </div>
    </div>
  );
}
