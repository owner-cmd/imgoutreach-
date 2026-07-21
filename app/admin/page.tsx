"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, ChevronDown, ChevronUp, LogOut } from "lucide-react";

type Order = {
  stripe_session_id: string;
  student_name: string;
  student_email: string;
  specialty: string;
  tier: string;
  physician_count: number;
  drafts_completed: number;
  status: string;
  submitted_at: string;
  amount_paid: number;
};

type Draft = {
  doctor_name: string;
  doctor_email: string;
  specialty: string;
  state: string;
  subject: string;
  body: string;
  quality_score: number;
  pub_count: number;
  cv_drive_link: string;
  status: string;
  replied: boolean;
  replied_at: string | null;
  sent_at: string | null;
  opened_at: string | null;
  open_count: number | null;
  reply_subject: string | null;
  reply_snippet: string | null;
  reply_body: string | null;
};

const hasReplied = (d: Draft) => !!d.replied_at || d.status === "replied" || d.replied;

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-600",
  processing: "bg-yellow-100 text-yellow-800",
  drafts_ready: "bg-blue-100 text-blue-800",
  needs_attention: "bg-red-100 text-red-800",
  approved: "bg-purple-100 text-purple-800",
  sent: "bg-emerald-100 text-emerald-800",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft[]>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const [approved, setApproved] = useState<string[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [ran, setRan] = useState<string[]>([]);

  const storedPw = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") || "" : "";

  useEffect(() => {
    if (storedPw) tryAuth(storedPw);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function tryAuth(pw: string) {
    const res = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${pw}` },
    });
    if (res.ok) {
      sessionStorage.setItem("admin_pw", pw);
      setAuthed(true);
      setOrders(await res.json());
    } else {
      setAuthError("Wrong password");
    }
  }

  const loadDrafts = useCallback(async (sessionId: string, pw: string) => {
    if (drafts[sessionId]) return;
    const res = await fetch(`/api/admin/drafts/${sessionId}`, {
      headers: { Authorization: `Bearer ${pw}` },
    });
    if (res.ok) {
      const data = await res.json();
      setDrafts(prev => ({ ...prev, [sessionId]: data }));
    }
  }, [drafts]);

  useEffect(() => {
    if (expanded && authed) {
      const pw = sessionStorage.getItem("admin_pw") || "";
      loadDrafts(expanded, pw);
    }
  }, [expanded, authed, loadDrafts]);

  async function runWorkflow(sessionId: string) {
    setRunning(sessionId);
    const pw = sessionStorage.getItem("admin_pw") || "";
    const res = await fetch("/api/admin/run-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ stripe_session_id: sessionId }),
    });
    setRunning(null);
    if (res.ok) {
      setRan(prev => [...prev, sessionId]);
      setOrders(prev => prev.map(o => o.stripe_session_id === sessionId ? { ...o, status: "processing" } : o));
    } else {
      alert("Failed to trigger workflow — check n8n");
    }
  }

  async function approve(sessionId: string) {
    setApproving(sessionId);
    const pw = sessionStorage.getItem("admin_pw") || "";
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ stripe_session_id: sessionId }),
    });
    setApproving(null);
    if (res.ok) {
      setApproved(prev => [...prev, sessionId]);
      setOrders(prev => prev.map(o => o.stripe_session_id === sessionId ? { ...o, status: "approved" } : o));
    } else {
      alert("Approval failed — check n8n");
    }
  }

  function logout() {
    sessionStorage.removeItem("admin_pw");
    setAuthed(false);
    setPassword("");
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card max-w-sm w-full mx-4 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Access</h1>
          <input
            type="password"
            className="input mb-3"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryAuth(password)}
          />
          {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
          <button className="btn-primary w-full" onClick={() => tryAuth(password)}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && (
            <p className="text-gray-400 text-sm">No orders yet.</p>
          )}
          {orders.map(order => {
            const isExpanded = expanded === order.stripe_session_id;
            const orderDrafts = drafts[order.stripe_session_id] || [];
            const draftsLoaded = drafts[order.stripe_session_id] !== undefined;
            const isApproved = approved.includes(order.stripe_session_id);

            return (
              <div key={order.stripe_session_id} className="card overflow-hidden">
                {/* Order header */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : order.stripe_session_id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{order.student_name}</p>
                      <p className="text-xs text-gray-400">{order.student_email} · {order.specialty}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{order.drafts_completed} / {order.physician_count} drafts</p>
                      <p className="text-xs text-gray-400">
                        {drafts[order.stripe_session_id]?.filter(hasReplied).length > 0 && (
                          <span className="text-emerald-600 font-medium mr-2">
                            {drafts[order.stripe_session_id].filter(hasReplied).length} repl{drafts[order.stripe_session_id].filter(hasReplied).length === 1 ? "y" : "ies"}
                          </span>
                        )}
                        ${(order.amount_paid / 100).toFixed(0)} · {order.tier}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* Drafts list */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Run Workflow button */}
                    {(order.status === "pending_payment" || order.status === "processing") && !ran.includes(order.stripe_session_id) && (
                      <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
                        <p className="text-sm text-yellow-800 font-medium">
                          {order.status === "pending_payment" ? "Payment received — workflow not started" : "Workflow running or paused"}
                        </p>
                        <button
                          className="bg-yellow-700 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
                          onClick={() => runWorkflow(order.stripe_session_id)}
                          disabled={running === order.stripe_session_id}
                        >
                          {running === order.stripe_session_id ? "Starting…" : "Run Workflow"}
                        </button>
                      </div>
                    )}
                    {ran.includes(order.stripe_session_id) && (
                      <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
                        <p className="text-sm text-yellow-800 font-medium">Workflow triggered — check back in ~30 minutes</p>
                      </div>
                    )}
                    {/* Approve button — only when drafts actually exist */}
                    {order.status === "drafts_ready" && orderDrafts.length > 0 && !isApproved && (
                      <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                        <p className="text-sm text-blue-800 font-medium">{orderDrafts.length} drafts ready for review</p>
                        <button
                          className="btn-primary text-sm px-4 py-2"
                          onClick={() => approve(order.stripe_session_id)}
                          disabled={approving === order.stripe_session_id}
                        >
                          {approving === order.stripe_session_id ? "Sending…" : "Approve & Send to Student"}
                        </button>
                      </div>
                    )}
                    {/* Incomplete run — partial or empty. Customer stays on
                        "Researching physicians"; this is your signal to fix it. */}
                    {(order.status === "needs_attention" ||
                      (order.status === "drafts_ready" && draftsLoaded && orderDrafts.length === 0)) &&
                      !isApproved && (
                      <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
                        <p className="text-sm text-red-800 font-medium">
                          Needs attention — {order.drafts_completed} of {order.physician_count} drafts written.
                          {order.drafts_completed === 0
                            ? " Nothing found — check the filters and re-run."
                            : " Partial — widen the filter and re-run to complete it."}
                        </p>
                        <button
                          className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                          onClick={() => runWorkflow(order.stripe_session_id)}
                          disabled={running === order.stripe_session_id}
                        >
                          {running === order.stripe_session_id ? "Starting…" : "Re-run Workflow"}
                        </button>
                      </div>
                    )}
                    {isApproved && (
                      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <p className="text-sm text-emerald-800 font-medium">Approved — drafts sent to student</p>
                      </div>
                    )}

                    {orderDrafts.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-gray-400">{draftsLoaded ? "No drafts yet." : "Loading drafts…"}</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {orderDrafts.map((draft, i) => (
                          <div key={i} className="px-5 py-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-semibold text-gray-900">{draft.doctor_name}</p>
                                  {hasReplied(draft) && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                      <CheckCircle size={10} /> Replied
                                    </span>
                                  )}
                                  {!hasReplied(draft) && draft.sent_at && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Sent</span>
                                  )}
                                  {!hasReplied(draft) && !draft.sent_at && draft.opened_at && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Opened{draft.open_count && draft.open_count > 1 ? ` ×${draft.open_count}` : ""}</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400">{draft.doctor_email} · {draft.specialty} · {draft.state}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-gray-400">Q: {draft.quality_score}</span>
                                <span className="text-xs text-gray-400">{draft.pub_count} pubs</span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-700 mb-1">Subject: {draft.subject}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{draft.body}</p>
                            {hasReplied(draft) && (
                              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-semibold text-emerald-800">
                                    Reply from {draft.doctor_name}
                                  </p>
                                  {draft.replied_at && (
                                    <p className="text-xs text-emerald-600">{new Date(draft.replied_at).toLocaleDateString()}</p>
                                  )}
                                </div>
                                {draft.reply_subject && (
                                  <p className="text-xs font-medium text-emerald-700 mb-1">Re: {draft.reply_subject}</p>
                                )}
                                <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap">
                                  {draft.reply_body || draft.reply_snippet || "Reply detected — content not captured yet (will appear on next poll)."}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
