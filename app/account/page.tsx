"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, FileText, ArrowRight, LogOut, Search, Mail, CheckCircle, Clock } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

interface Application {
  sessionId: string;
  specialty: string;
  physicianCount: number;
  tier: string;
  submittedAt: string;
  reviewToken: string;
  draftsTotal: number;
  sentCount: number;
  status: "researching" | "ready" | "sending" | "sent";
}

const STATUS: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  researching: { label: "Researching physicians", cls: "bg-amber-100 text-amber-800 border-amber-200", icon: Search },
  ready: { label: "Ready to review", cls: "bg-blue-100 text-blue-800 border-blue-200", icon: Mail },
  sending: { label: "Sending", cls: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Clock },
  sent: { label: "All sent", cls: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
};

function tierLabel(t: string) {
  if (t === "trial") return "Free trial";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session?.user) {
        window.location.replace(`/signin?next=${encodeURIComponent("/account")}`);
        return;
      }
      setEmail(session.user.email ?? null);
      try {
        const res = await fetch("/api/my-orders", { headers: { Authorization: `Bearer ${session.access_token}` } });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load your applications.");
        setApps(json.applications || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your applications.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">My applications</h1>
        {email && (
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1.5">
            <LogOut size={14} /> Sign out
          </button>
        )}
      </div>
      {email && <p className="text-gray-500 text-sm mb-8">Signed in as {email}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-12 justify-center">
          <Loader2 className="animate-spin text-blue-700" size={18} /> Loading your applications…
        </div>
      ) : error ? (
        <div className="card p-6 text-sm text-red-700 bg-red-50 border-red-200">{error}</div>
      ) : apps.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="text-blue-700" size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No applications yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Start your first outreach campaign — pick your target physicians and we&apos;ll draft personalized emails for each one.
          </p>
          <Link href="/request" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Create your first application
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Link href="/request" className="btn-primary inline-flex items-center gap-2 text-sm py-2">
              <Plus size={16} /> New application
            </Link>
          </div>
          <div className="space-y-4">
            {apps.map((a) => {
              const s = STATUS[a.status];
              const Icon = s.icon;
              const canReview = a.draftsTotal > 0;
              return (
                <div key={a.sessionId} className="card p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{a.specialty || "Physician outreach"}</h3>
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                          {tierLabel(a.tier)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {a.physicianCount} drafts · started {new Date(a.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 ${s.cls}`}>
                      <Icon size={13} /> {s.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {a.draftsTotal > 0
                        ? `${a.sentCount} of ${a.draftsTotal} sent`
                        : "We'll email you when your drafts are ready"}
                    </p>
                    {canReview ? (
                      <Link
                        href={`/review/${a.sessionId}?t=${a.reviewToken}`}
                        className="btn-primary inline-flex items-center gap-1.5 text-sm py-2"
                      >
                        Review &amp; send <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Loader2 className="animate-spin" size={13} /> Preparing…
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
