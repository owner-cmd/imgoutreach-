"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Send, Sparkles, AlertTriangle, Check, ShieldCheck } from "lucide-react";

type Draft = {
  doctor_npi: string;
  doctor_name: string;
  doctor_email: string;
  specialty: string;
  subject: string;
  body: string;
  email_verified: boolean;
  email_inferred: boolean;
  quality_score: number;
  send_status: string; // draft | queued | sent | failed
  sent_at: string | null;
};

type OrderInfo = { student_name: string; tier: string; isPaid: boolean; physician_count: number };

function ReviewInner() {
  const params = useParams();
  const search = useSearchParams();
  const sessionId = String(params.sessionId);
  const token = search.get("t") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [ready, setReady] = useState(true);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [tweaking, setTweaking] = useState<string | null>(null);
  const [tweakText, setTweakText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${sessionId}?t=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error("This link is invalid or expired.");
      const data = await res.json();
      setOrder(data.order);
      setReady(data.ready !== false);
      setDrafts(data.drafts);
      // Default: include every draft that has an email and hasn't been sent.
      const inc: Record<string, boolean> = {};
      for (const d of data.drafts) inc[d.doctor_npi] = !!d.doctor_email && d.send_status !== "sent";
      setIncluded(inc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => { load(); }, [load]);

  const editField = (npi: string, field: "subject" | "body", value: string) =>
    setDrafts(ds => ds.map(d => (d.doctor_npi === npi ? { ...d, [field]: value } : d)));

  const tweak = async (npi: string) => {
    const instruction = (tweakText[npi] || "").trim();
    if (!instruction) return;
    setTweaking(npi);
    try {
      const res = await fetch(`/api/orders/${sessionId}/tweak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, doctor_npi: npi, instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Edit failed");
      setDrafts(ds => ds.map(d => (d.doctor_npi === npi ? { ...d, subject: data.subject, body: data.body } : d)));
      setTweakText(t => ({ ...t, [npi]: "" }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setTweaking(null);
    }
  };

  const sendAll = async () => {
    const selected = drafts.filter(d => included[d.doctor_npi] && d.doctor_email && d.send_status !== "sent");
    if (selected.length === 0) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${sessionId}/queue-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          drafts: selected.map(d => ({ doctor_npi: d.doctor_npi, subject: d.subject, body: d.body })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not queue");
      await load();
      alert(`${data.queued} email${data.queued === 1 ? "" : "s"} queued — they'll send from your Gmail over the next few hours.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not queue");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="pt-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-700" /></div>;
  if (error) return <div className="pt-32 text-center text-red-600">{error}</div>;
  if (!ready) return (
    <div className="pt-32 pb-24 max-w-lg mx-auto px-6 text-center">
      <Loader2 className="animate-spin mx-auto text-blue-700 mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-2">Your drafts are being prepared</h1>
      <p className="text-gray-500 text-sm">
        {order?.student_name ? `${order.student_name}, we` : "We"}&rsquo;re putting the finishing touches on your
        personalized emails. You&rsquo;ll get an email the moment they&rsquo;re ready to review — usually within 24 hours.
      </p>
    </div>
  );

  const selectedCount = drafts.filter(d => included[d.doctor_npi] && d.doctor_email && d.send_status !== "sent").length;
  const sentCount = drafts.filter(d => d.send_status === "sent").length;
  const queuedCount = drafts.filter(d => d.send_status === "queued").length;

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Review &amp; send your drafts</h1>
      <p className="text-gray-500 text-sm mb-6">
        {order?.student_name ? `${order.student_name}, ` : ""}review each email, edit if you like, then send them all from your Gmail with one click.
        {sentCount > 0 && ` · ${sentCount} sent`}{queuedCount > 0 && ` · ${queuedCount} queued`}
      </p>

      <div className="space-y-4">
        {drafts.map(d => {
          const locked = d.send_status === "sent" || d.send_status === "queued";
          return (
            <div key={d.doctor_npi} className={`card p-5 ${locked ? "opacity-70" : ""}`}>
              <div className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  className="mt-1 accent-blue-800"
                  disabled={locked || !d.doctor_email}
                  checked={!!included[d.doctor_npi]}
                  onChange={e => setIncluded(s => ({ ...s, [d.doctor_npi]: e.target.checked }))}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{d.doctor_name}</p>
                    {d.send_status === "sent" && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Sent</span>}
                    {d.send_status === "queued" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Queued</span>}
                    {d.send_status === "failed" && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Failed</span>}
                    {d.email_verified
                      ? <span className="text-[11px] inline-flex items-center gap-1 text-emerald-700"><ShieldCheck size={12} /> verified</span>
                      : d.doctor_email
                      ? <span className="text-[11px] inline-flex items-center gap-1 text-amber-700"><AlertTriangle size={12} /> unverified{d.email_inferred ? " (best-guess address)" : ""}</span>
                      : <span className="text-[11px] text-red-600">no email found</span>}
                  </div>
                  <p className="text-xs text-gray-400">{d.doctor_email || "—"} · {d.specialty}</p>
                </div>
              </div>

              <input
                className="input mb-2 text-sm font-medium"
                value={d.subject}
                disabled={locked}
                onChange={e => editField(d.doctor_npi, "subject", e.target.value)}
              />
              <textarea
                className="input text-sm min-h-[150px] resize-y"
                value={d.body}
                disabled={locked}
                onChange={e => editField(d.doctor_npi, "body", e.target.value)}
              />

              {/* AI tweak — paid only */}
              {!locked && (
                <div className="mt-2">
                  {order?.isPaid ? (
                    <div className="flex gap-2">
                      <input
                        className="input text-sm flex-1"
                        placeholder="Tweak with AI — e.g. make it shorter, warmer, mention I'm free this summer"
                        value={tweakText[d.doctor_npi] || ""}
                        onChange={e => setTweakText(t => ({ ...t, [d.doctor_npi]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") tweak(d.doctor_npi); }}
                      />
                      <button
                        className="btn-outline text-sm px-3 flex items-center gap-1 shrink-0"
                        onClick={() => tweak(d.doctor_npi)}
                        disabled={tweaking === d.doctor_npi}
                      >
                        {tweaking === d.doctor_npi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Tweak
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg px-3 py-2">
                      <Sparkles size={14} /> Edit with AI — <span className="text-blue-700 font-medium">available on paid plans</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky send bar */}
      <div className="sticky bottom-4 mt-6">
        <div className="card p-4 flex items-center justify-between shadow-lg border-blue-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{selectedCount}</span> selected to send
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={sendAll} disabled={sending || selectedCount === 0}>
            {sending ? <><Loader2 size={16} className="animate-spin" /> Queuing…</> : <><Send size={16} /> Send All Selected</>}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
          <Check size={11} /> Sent from your Gmail, spaced out over a few hours to protect your account.
        </p>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return <Suspense><ReviewInner /></Suspense>;
}
