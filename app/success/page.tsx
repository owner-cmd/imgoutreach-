"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const isTrial = sessionId.startsWith("trial_");

  return (
    <div className="pt-28 pb-20 max-w-xl mx-auto px-4 sm:px-6">
      {/* Confirmation */}
      <div className="card p-8 text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isTrial ? "Your free trial has started" : "Payment confirmed"}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          We&apos;re researching your physicians and drafting your personalized emails now.
          You&apos;ll get an email when everything is ready — usually within 24 hours.
        </p>
      </div>

      {/* What happens next */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">What happens next</h3>
        <div className="space-y-3">
          {[
            { text: "We research each physician on PubMed and the web", done: true },
            { text: "We write a personalized email for each one", done: false },
            { text: "We email you a link to your review page when they're ready", done: false },
            { text: "You review, edit anything you like, and send them all with one click", done: false },
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
