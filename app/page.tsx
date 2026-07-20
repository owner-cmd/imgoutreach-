import Link from "next/link";
import { ArrowRight, CheckCircle, Forward, Mail, Paperclip, Reply, Search, Star, Zap } from "lucide-react";
import HeroSection from "./components/HeroSection";

const steps = [
  { icon: <Mail className="w-6 h-6 text-blue-800" />, title: "Tell us about yourself", desc: "Select your target specialty, location, and purpose. Upload your CV and write a brief letter of interest." },
  { icon: <Search className="w-6 h-6 text-blue-800" />, title: "We research every physician", desc: "Our AI scans PubMed, physician directories, and institutional pages to find real research interests and contact emails." },
  { icon: <Zap className="w-6 h-6 text-blue-800" />, title: "Emails are written for each doctor", desc: "Each draft references the physician's published work and connects it to your genuine interests — not a template." },
  { icon: <Star className="w-6 h-6 text-blue-800" />, title: "Review & send with one click", desc: "Every draft appears on your review page — edit anything you like, then send them all from your own Gmail with one click." },
];

const emailExample = {
  from: "Rohan Mehta <r.mehta@aiims.edu>",
  to: "Dr. Sandra Collins, MD — Johns Hopkins Internal Medicine",
  subject: "Internal Medicine Observership — AIIMS Grad, Step 2 251",
  date: "Mon, Jun 30, 2026, 8:47 AM",
  body: `I'm an AIIMS graduate with an interest in internal medicine. I came across your 2023 paper on early warning score implementation in general wards and your findings on reducing preventable deterioration in hospitalized patients interested me. I'm ECFMG certified, Step 1 passed, Step 2 251, available from January 2027. CV attached — would an observership be possible?`,
  signoff: "Rohan Mehta | All India Institute of Medical Sciences",
  attachments: ["CV_Rohan_Mehta.pdf"],
  reply: {
    from: "Dr. Sandra Collins",
    text: "Rohan — January works. Let's do a quick call first. Send me a couple of times that work for you.",
    date: "Tue, Jul 1, 2026, 10:22 AM",
  },
};

export default function Home() {
  return (
    <div className="pt-16">
      <HeroSection />


      {/* Email preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Every email is different. Every email is real.</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Not a merge-field template. Our AI reads the physician&apos;s actual research and writes something you&apos;d actually send.</p>
        </div>
        <div className="card max-w-2xl mx-auto overflow-hidden">
          {/* Specialty bar */}
          <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-widest">Internal Medicine — Hospital Medicine</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">IMG Graduate · India</span>
          </div>
          {/* Sender row */}
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-semibold shrink-0">RM</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Rohan Mehta <span className="text-gray-400 font-normal">&lt;{emailExample.from.match(/<(.+)>/)?.[1]}&gt;</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">to {emailExample.to}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs text-gray-400 hidden sm:block">{emailExample.date}</p>
                <Star size={15} className="text-gray-300" />
                <Reply size={15} className="text-gray-300" />
                <Forward size={15} className="text-gray-300" />
              </div>
            </div>
          </div>
          {/* Subject */}
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-900">{emailExample.subject}</p>
          </div>
          {/* Body */}
          <div className="px-5 py-5">
            <p className="text-gray-700 leading-relaxed text-sm">{emailExample.body}</p>
            <div className="mt-4 text-sm">
              <p className="text-gray-700 font-medium">{emailExample.signoff}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {emailExample.attachments.map((file) => (
                  <span key={file} className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                    <Paperclip size={11} />
                    {file}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Reply / Forward buttons */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
              <Reply size={12} /> Reply
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
              <Forward size={12} /> Forward
            </button>
          </div>
          {/* Physician reply */}
          <div className="border-t-2 border-emerald-100 bg-emerald-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-semibold shrink-0">CB</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {emailExample.reply.from}{" "}
                    <span className="text-xs text-emerald-600 font-medium ml-1">↩ replied</span>
                  </p>
                  <p className="text-xs text-gray-400">{emailExample.reply.date}</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{emailExample.reply.text}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/examples" className="text-blue-800 hover:underline font-medium">See more examples →</Link>
        </p>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-600">Four steps from sign-up to inbox-ready drafts.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <p className="text-xs text-blue-800 font-semibold uppercase tracking-widest mb-2">Step {i + 1}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="hidden md:block max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why physicians actually reply</h2>
            <div className="space-y-4">
              {[
                "Each email references the physician's specific published research by name",
                "Emails are 3–4 sentences — short enough to read in 30 seconds",
                "Written in a realistic medical student or IMG voice, not consultant prose",
                "Physicians with no discoverable email are filtered out automatically",
                "Quality-scored: low-match physicians are filtered out automatically",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-800 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-8 space-y-5">
            <h3 className="font-semibold text-gray-900">Estimated reply rates</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-600">Generic template emails</span>
                <span className="text-red-600 font-semibold">&lt; 2%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-600">Self-written cold emails</span>
                <span className="text-yellow-700 font-semibold">5–8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-semibold">IMG Outreach personalized drafts</span>
                <span className="text-blue-800 font-bold">15–25%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Based on student-reported outcomes. Results vary by specialty and location.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to reach more physicians?</h2>
          <p className="text-blue-100 mb-8 text-lg">Your first 25 drafts are free — no card required. Paid plans from $279 for 50 drafts, delivered within 24 hours.</p>
          <Link href="/request" className="inline-flex items-center gap-2 bg-white text-blue-900 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all text-base">
            Start your request <ArrowRight size={18} />
          </Link>
          <p className="text-sm text-blue-200 mt-5">
            <Link href="/pricing" className="underline underline-offset-2 hover:text-white">View all pricing options</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
