import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
        <p className="font-bold text-blue-900 text-base">IMG Outreach</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link href="/examples" className="hover:text-gray-800 transition-colors">Examples</Link>
          <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-gray-800 transition-colors">Contact</Link>
          <Link href="/terms" className="hover:text-gray-800 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-800 transition-colors">Privacy</Link>
          <Link href="/request" className="hover:text-gray-800 transition-colors">Get Started</Link>
        </div>
        <p>© {new Date().getFullYear()} IMG Outreach. All rights reserved.</p>
      </div>
    </footer>
  );
}
