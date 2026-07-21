"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LayoutGrid } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSignedIn(!!data.session?.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setSignedIn(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-blue-900 tracking-tight">IMG Outreach</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link href="/examples" className="hover:text-blue-900 transition-colors">Examples</Link>
          <Link href="/pricing" className="hover:text-blue-900 transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-blue-900 transition-colors">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {signedIn ? (
            <Link href="/account" className="text-sm text-gray-600 hover:text-blue-900 transition-colors flex items-center gap-1.5">
              <LayoutGrid size={15} /> My applications
            </Link>
          ) : (
            <Link href="/signin?next=%2Faccount" className="text-sm text-gray-600 hover:text-blue-900 transition-colors">Sign in</Link>
          )}
          <Link href="/request" className="btn-primary text-sm py-2">Get Started</Link>
        </div>
        <div className="md:hidden flex items-center gap-4">
          {signedIn ? (
            <Link href="/account" aria-label="My applications" className="text-gray-700 flex items-center gap-1.5 text-sm font-medium">
              <LayoutGrid size={18} /> Applications
            </Link>
          ) : (
            <Link href="/signin?next=%2Faccount" className="text-sm font-semibold text-blue-900">Sign in</Link>
          )}
          <button className="text-gray-500" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/examples" className="text-gray-600" onClick={() => setOpen(false)}>Examples</Link>
          <Link href="/pricing" className="text-gray-600" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/contact" className="text-gray-600" onClick={() => setOpen(false)}>Contact</Link>
          {signedIn ? (
            <Link href="/account" className="text-gray-600 flex items-center gap-1.5" onClick={() => setOpen(false)}>
              <LayoutGrid size={15} /> My applications
            </Link>
          ) : (
            <Link href="/signin?next=%2Faccount" className="text-gray-600" onClick={() => setOpen(false)}>Sign in</Link>
          )}
          <Link href="/request" className="btn-primary text-center" onClick={() => setOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
