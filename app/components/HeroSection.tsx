"use client";
import { useState } from "react";
import { Send, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const drafts = [
  { from: "Rohan Mehta", initials: "RM", to: "Dr. Sandra Collins", institution: "Johns Hopkins", subject: "Internal Medicine Observership — AIIMS Grad, Step 2 251", preview: "I came across your 2023 paper on early warning scores and your findings on reducing preventable deterioration interested me." },
  { from: "Karim Nasser", initials: "KN", to: "Dr. James Holloway", institution: "Cleveland Clinic", subject: "General Surgery — Ain Shams MS4, Step 1 Passed", preview: "I came across your paper comparing laparoscopic and robotic approaches in complex abdominal wall repair." },
  { from: "Amara Diallo", initials: "AD", to: "Dr. Marcus Webb", institution: "Yale School of Medicine", subject: "Psychiatry Research — Dakar Grad, Step 2 241", preview: "I came across your 2024 paper on ketamine mechanisms and your findings on rapid antidepressant response." },
  { from: "Isabella Rodrigues", initials: "IR", to: "Dr. Lisa Harmon", institution: "Mass General Hospital", subject: "Emergency Medicine Observership — USP MS4", preview: "I came across your paper on POCUS in undifferentiated hypotension and your findings on time-to-diagnosis." },
  { from: "Rohan Mehta", initials: "RM", to: "Dr. Rachel Kim", institution: "UCSF Medical Center", subject: "Cardiology Research — AIIMS Graduate, Step 2 248", preview: "I came across your work on cardiac imaging biomarkers and early HFpEF detection." },
];

const replies = [
  { from: "Dr. Sandra Collins", institution: "Johns Hopkins · Internal Medicine", text: "Rohan — January works. Let's do a quick call first. Send me a couple of times that work for you.", initials: "SC", color: "bg-blue-100 text-blue-800" },
  { from: "Dr. James Holloway", institution: "Cleveland Clinic · General Surgery", text: "Karim — February works. Come by for a week and scrub in. I'll have my assistant send you the details.", initials: "JH", color: "bg-violet-100 text-violet-800" },
  { from: "Dr. Marcus Webb", institution: "Yale · Psychiatry", text: "Amara — good timing, we're starting a new cohort in the fall. Let's talk soon.", initials: "MW", color: "bg-emerald-100 text-emerald-800" },
];

function getCardStyle(i: number, total: number, isSending: boolean): React.CSSProperties {
  const PEEK = 14;
  const frontOffset = (total - 1) * PEEK;
  const top = frontOffset - i * PEEK;
  return {
    top: `${top}px`,
    zIndex: total - i,
    boxShadow: i === 0 ? "0 8px 28px rgba(0,0,0,0.11)" : "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    opacity: isSending ? Math.max(0, 1 - i * 0.25) : 1,
    transition: isSending ? `opacity 0.5s ease ${i * 0.08}s` : "none",
  };
}

function getReplyStyle(i: number, total: number): React.CSSProperties {
  const PEEK = 14;
  const frontOffset = (total - 1) * PEEK;
  const top = frontOffset - i * PEEK;
  return {
    top: `${top}px`,
    zIndex: total - i,
    boxShadow: i === 0 ? "0 8px 28px rgba(0,0,0,0.11)" : "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    opacity: 0,
    animation: `fadeInUp 0.4s ease-out ${i * 0.15}s forwards`,
  };
}

export default function HeroSection() {
  const [phase, setPhase] = useState<"idle" | "sending" | "replies">("idle");

  function handleSend() {
    setPhase("sending");
    setTimeout(() => setPhase("replies"), 1400);
  }

  const total = drafts.length;
  const replyTotal = replies.length;
  const stackHeight = (total - 1) * 14 + 210;
  const replyStackHeight = (replyTotal - 1) * 14 + 170;

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20 pt-28">

        {/* Left: headline */}
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-3">For IMGs &amp; medical students</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5 text-balance">
            Your US elective or research position — <span className="text-blue-900">500 personalized emails, one click.</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Pick your physicians. Our AI researches each one and writes a tailored email. You review, then send all 500 from your own Gmail in a single click.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              "Up to 500 physicians",
              "Ready within 24 hours",
              "Sent from your Gmail",
              "Spam-safe sending",
            ].map(p => (
              <span key={p} className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5">{p}</span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/request" className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all">
              Get started <ArrowRight size={17} />
            </Link>
            <Link href="/examples" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-8 py-4 rounded-xl text-base transition-all">
              See example emails
            </Link>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full px-4 py-1.5 text-sm font-semibold">
            <Sparkles size={15} /> 25 free drafts to start — no card required
          </div>
        </div>

        {/* Right: stacked cards */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm mb-6" style={{ height: `${phase === "replies" ? replyStackHeight : stackHeight}px` }}>

            {phase !== "replies" && drafts.map((draft, i) => (
              <div key={i} className="absolute w-full bg-white rounded-2xl overflow-hidden" style={getCardStyle(i, total, phase === "sending")}>
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {draft.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">{draft.from}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full ml-2 shrink-0 font-medium">Draft</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">to {draft.to} · {draft.institution}</p>
                  </div>
                </div>
                {i === 0 && (
                  <>
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                      <p className="text-sm font-semibold text-gray-800 mb-1.5 leading-snug">{draft.subject}</p>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{draft.preview}</p>
                    </div>
                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                      + 495 more drafts ready to send
                    </div>
                  </>
                )}
              </div>
            ))}

            {phase === "replies" && replies.map((reply, i) => (
              <div key={i} className="absolute w-full bg-white rounded-2xl overflow-hidden" style={getReplyStyle(i, replyTotal)}>
                <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-100">
                  <div className={`w-8 h-8 rounded-full ${reply.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {reply.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{reply.from}</p>
                    <p className="text-xs text-gray-400 truncate">{reply.institution}</p>
                  </div>
                </div>
                {i === 0 && (
                  <div className="bg-emerald-50 border-t-2 border-emerald-100 px-4 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-emerald-600 font-semibold">↩ replied</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{reply.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {phase === "idle" && (
            <button onClick={handleSend} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md">
              <Send size={15} /> Send all 500 drafts
            </button>
          )}
          {phase === "sending" && (
            <div className="flex items-center gap-2.5 text-gray-400 text-sm py-3.5">
              <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
              Sending 500 drafts to Gmail…
            </div>
          )}
          {phase === "replies" && (
            <div className="text-center" style={{ opacity: 0, animation: "fadeInUp 0.5s ease-out 0.6s forwards" }}>
              <p className="text-lg font-bold text-gray-900">3 replies already</p>
              <p className="text-gray-400 text-xs mt-1">Physicians are responding. Check your Gmail.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
