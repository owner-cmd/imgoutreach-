import Link from "next/link";
import { Check, ArrowRight, Mail } from "lucide-react";
import { PLANS, SHARED_FEATURES } from "@/lib/stripe";

export default function PricingPage() {
  return (
    <div className="pt-28 pb-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-blue-800 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">Simple, one-time pricing</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Pay once, get your email drafts delivered within 24 hours. No subscription, no hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card p-7 relative flex flex-col ${plan.popular ? "ring-2 ring-blue-700 shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="mb-5">
                <p className="text-sm font-semibold text-blue-800 uppercase tracking-widest mb-2">{plan.name}</p>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 mb-1 text-sm">one-time</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-1">{plan.count} personalized drafts</p>
                <p className="text-xs text-gray-500 leading-relaxed">{plan.description}</p>
              </div>
              <ul className="space-y-2.5 mb-7 flex-1">
                {SHARED_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/request?plan=${plan.id}`}
                className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-blue-900 hover:bg-blue-800 text-white"
                    : "border border-gray-300 hover:border-blue-800 text-gray-700 hover:text-blue-900"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}

          {/* Custom / Contact card */}
          <div className="card p-7 flex flex-col">
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-800 uppercase tracking-widest mb-2">Custom</p>
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-3xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-1">500+ personalized drafts</p>
              <p className="text-xs text-gray-500 leading-relaxed">Full national sweep or bulk orders for programs and advisors</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {[...SHARED_FEATURES, "Custom prompt tuning for your background", "Sample email review before full run", "Dedicated support"].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-2"
            >
              <Mail size={14} /> Contact us
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Are physicians guaranteed to reply?",
                a: "No — and we'll never promise that. Whether a physician replies depends on their schedule, interest, and how attractive your profile is to them. What we guarantee is that every email is tailored, references their real research, and is written to give you the best possible shot. The rest is up to them.",
              },
              {
                q: "How are the emails personalized?",
                a: "Our AI searches PubMed for each physician's publications, scans their institutional page, and identifies their research focus. It then combines that with what you wrote about yourself — your cases, interests, and background — and writes an email using the best available AI models. The result references their specific work and connects it to your genuine story, not just your specialty.",
              },
              {
                q: "How long does it take?",
                a: "Most orders are delivered within 24 hours after payment. You'll receive an email with a link to review your drafts.",
              },
              {
                q: "What do I do with the drafts?",
                a: "Open your review page, read through each email (edit anything you like), and click Send All. We send them from your own Gmail, spaced out so they look natural — your CV attached to every one.",
              },
              {
                q: "I'm an IMG — does this work for me?",
                a: "Yes — the majority of our customers are IMGs. The emails are written to reflect your background authentically, whether you're seeking observerships, research opportunities, or clinical exposure before residency.",
              },
              {
                q: "Will the emails make false claims about me?",
                a: "No. Every claim in the email either comes directly from what you wrote about yourself, or is something you can make true before you meet the physician. If the email says you came across their paper — you can read that paper before your meeting, and by the time you meet them it will be true. We never fabricate clinical experiences or credentials. The AI only works with what you give it.",
              },
              {
                q: "What documents should I upload?",
                a: "CV is required. Optionally upload additional documents like vaccination records, HIPAA training certificates, or letters — these will be noted in your drafts as recommended attachments.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/request" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Start your request <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
