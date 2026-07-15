"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const gmailConnected = searchParams.get("gmail") === "connected";

  const connectGmail = () => {
    window.location.href = `/api/auth/gmail?session_id=${sessionId}`;
  };

  return (
    <div className="pt-28 pb-20 max-w-xl mx-auto px-4 sm:px-6">
      {/* Payment confirmed */}
      <div className="card p-8 text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment confirmed</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          We&apos;re researching your physicians and drafting personalized emails now.
          You&apos;ll get a notification when everything is ready — usually within 24 hours.
        </p>
      </div>

      {/* Gmail connect */}
      <div className={`card p-7 border-2 ${gmailConnected ? "border-green-400 bg-green-50" : "border-blue-300 bg-blue-50"}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
            <Mail className={gmailConnected ? "text-green-600" : "text-blue-800"} size={20} />
          </div>
          <div className="flex-1">
            {gmailConnected ? (
              <>
                <p className="font-semibold text-green-800 mb-1">Gmail connected ✓</p>
                <p className="text-sm text-green-700 leading-relaxed">
                  Your email drafts will appear directly in your Gmail Drafts folder with your CV pre-attached — ready to review and send.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-900 mb-1">Connect Gmail to get pre-loaded drafts</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Connect your Gmail and we&apos;ll place each personalized email directly into your Drafts folder with your CV already attached. You just open each draft, review it, and click Send.
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 space-y-1.5">
                  {[
                    "Drafts appear directly in your Gmail inbox",
                    "CV is pre-attached to every email",
                    "We only request permission to create drafts — nothing else",
                  ].map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="text-blue-700 shrink-0" size={13} />
                      {p}
                    </div>
                  ))}
                </div>
                <button
                  onClick={connectGmail}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect Gmail
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  You can also connect later from the link we email you.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="card p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">What happens next</h3>
        <div className="space-y-3">
          {[
            { text: "We research each physician on PubMed and the web", done: true },
            { text: "We write a personalized email for each one", done: false },
            { text: "Drafts are saved to your Gmail Drafts folder with your CV attached", done: false },
            { text: "You review and click Send — takes ~10 minutes total", done: false },
          ].map(({ text, done }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {done ? "✓" : i + 1}
              </div>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
