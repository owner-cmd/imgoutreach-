import Link from "next/link";
import { ArrowRight, CheckCircle, Mail, Search, Star, Zap } from "lucide-react";

const stats = [
  { value: "3×", label: "more replies vs generic emails" },
  { value: "< 24h", label: "delivery after payment" },
  { value: "1.1M+", label: "physicians in our database" },
  { value: "95%", label: "valid email rate" },
];

const steps = [
  { icon: <Mail className="w-6 h-6 text-blue-800" />, title: "Tell us about yourself", desc: "Select your target specialty, location, and purpose. Upload your CV and write a brief letter of interest." },
  { icon: <Search className="w-6 h-6 text-blue-800" />, title: "We research every physician", desc: "Our AI scans PubMed, physician directories, and institutional pages to find real research interests and verified emails." },
  { icon: <Zap className="w-6 h-6 text-blue-800" />, title: "Emails are written for each doctor", desc: "Each draft references the physician's published work and connects it to your genuine interests — not a template." },
  { icon: <Star className="w-6 h-6 text-blue-800" />, title: "You get ready-to-send drafts", desc: "Receive your full list of personalized email drafts in under 24 hours. Review, attach your CV, and send." },
];

const emailExample = {
  to: "Dr. Sarah Chen, MD — Northwestern Medicine Geriatrics",
  subject: "geriatrics observership — Rush MS3, Step 1 passed",
  body: `I'm finishing my third year at Rush and just came off an inpatient medicine month where about half our consults were patients over 75 on 8+ medications — most of the discharge planning felt like guesswork on who'd actually do okay at home. Your 2023 paper on frailty phenotyping explained the pattern I kept seeing: the phenotype score predicted readmission better than diagnosis count alone. I'm ECFMG-eligible, available January–March, and attached my CV. Would an observership work, or would a quick call be easier?`,
  from: "A.Karimi <a.karimi@rush.edu>",
};

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-900 font-medium mb-8">
            Built for US medical students and IMGs
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-6">
            Stop sending generic emails.<br />
            <span className="text-blue-900">Start getting replies.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you&apos;re an IMG seeking observerships and research, or a US student exploring a specialty — our AI researches each physician and writes a personalized cold email in your voice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/request" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Get your email drafts <ArrowRight size={18} />
            </Link>
            <Link href="/examples" className="btn-outline text-base px-8 py-4">
              See example emails
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold text-blue-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IMG callout */}
      <section className="bg-blue-900 border-b border-blue-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">For IMGs</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Getting US clinical experience starts with one reply
              </h2>
              <p className="text-blue-200 leading-relaxed text-sm">
                As an IMG, cold emailing physicians is often the only path to observerships, research positions, and the US clinical exposure you need for a competitive residency application. The problem isn&apos;t your qualifications — it&apos;s that generic emails get ignored. We fix that.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Emails tailored to your IMG background and goals",
                "Filter by specialty, state, and ethnicity of physician",
                "Works for observerships, research, and elective rotations",
                "Over 1.1 million US physicians with verified emails",
                "Used by IMGs from over 30 countries",
              ].map(p => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-blue-100 text-sm">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Email preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Every email is different. Every email is real.</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Not a merge-field template. Our AI reads the physician&apos;s actual research and writes something you&apos;d actually send.</p>
        </div>
        <div className="card max-w-2xl mx-auto overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            </div>
            <p className="text-xs text-gray-400 mx-auto">New Message</p>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-5 py-3 flex gap-3 text-sm">
              <span className="text-gray-400 w-10 shrink-0 pt-0.5">From</span>
              <span className="text-gray-700">{emailExample.from}</span>
            </div>
            <div className="px-5 py-3 flex gap-3 text-sm">
              <span className="text-gray-400 w-10 shrink-0 pt-0.5">To</span>
              <span className="text-gray-700">{emailExample.to}</span>
            </div>
            <div className="px-5 py-3 flex gap-3 text-sm">
              <span className="text-gray-400 w-10 shrink-0 pt-0.5">Subject</span>
              <span className="text-gray-900 font-semibold">{emailExample.subject}</span>
            </div>
            <div className="px-5 py-6">
              <p className="text-gray-700 leading-relaxed text-sm">{emailExample.body}</p>
              <p className="text-gray-500 text-sm mt-4">— A. Karimi, MS3 | Rush Medical College</p>
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why physicians actually reply</h2>
            <div className="space-y-4">
              {[
                "Each email references the physician's specific published research by name",
                "Emails are 3–4 sentences — short enough to read in 30 seconds",
                "Written in a realistic medical student or IMG voice, not consultant prose",
                "Only physicians with verified emails are included",
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
                <span className="text-gray-900 font-semibold">MedReach personalized drafts</span>
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
          <p className="text-blue-100 mb-8 text-lg">Starting at $279 for 50 personalized drafts. Delivered in under 24 hours.</p>
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
