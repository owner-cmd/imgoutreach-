import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="pt-28 pb-20 max-w-lg mx-auto px-4 sm:px-6 text-center">
      <div className="card p-10">
        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-5">
          <XCircle className="text-gray-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          No charge was made. Your information has been saved — you can go back and complete your order any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/request" className="btn-primary flex items-center justify-center gap-2 text-sm">
            Try again
          </Link>
          <Link href="/contact" className="btn-outline flex items-center justify-center gap-2 text-sm">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
