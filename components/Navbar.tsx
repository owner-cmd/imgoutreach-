"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-blue-900 tracking-tight">IMG Outreach</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link href="/examples" className="hover:text-blue-900 transition-colors">Examples</Link>
          <Link href="/pricing" className="hover:text-blue-900 transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-blue-900 transition-colors">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/request" className="btn-primary text-sm py-2">Get Started</Link>
        </div>
        <button className="md:hidden text-gray-500" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/examples" className="text-gray-600" onClick={() => setOpen(false)}>Examples</Link>
          <Link href="/pricing" className="text-gray-600" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/contact" className="text-gray-600" onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/request" className="btn-primary text-center" onClick={() => setOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
