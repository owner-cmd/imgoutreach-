import Link from "next/link";
import { ArrowRight, Reply, Forward, Star, Paperclip } from "lucide-react";

const examples = [
  {
    specialty: "Internal Medicine — Geriatrics",
    tag: "MS3 · IMG",
    physician: {
      name: "Dr. Michael Torres, MD",
      title: "Associate Professor of Medicine, Division of Geriatrics",
      institution: "University of Illinois at Chicago",
      city: "Chicago, IL",
      research: "Frailty phenotyping, polypharmacy in older adults, care transitions",
    },
    student: {
      name: "Aisha Karimi",
      school: "Aga Khan University",
      email: "a.karimi@aku.edu",
      year: "MS3",
      credentials: "Step 2 CK: 248 · ECFMG certified · US rotations at UIC (Internal Medicine)",
    },
    subject: "MS3, Step 2 248 — observership in geriatrics?",
    body: `I'm finishing my MS3 year at Aga Khan University with a strong focus on internal medicine and have completed a rotation at UIC's internal medicine service. Your 2023 paper on frailty phenotyping in patients with polypharmacy directly connects to cases I saw during that rotation — the gap between frailty screening in theory and what actually happens at discharge was striking, and your framework gave me a cleaner way to think about it.

I'm ECFMG certified, fully vaccinated, and available January–March 2027. I'd aim to be a low-burden observer — no compensation needed. Would you be open to a brief observership, or even a 10-minute call first?`,
    attachments: ["CV_Aisha_Karimi.pdf"],
    date: "Tue, Jul 1, 2026, 8:42 AM",
    reply: {
      text: "Hi Aisha, thanks for reaching out — your background looks strong. I have a few slots opening in February. Let's find a time to talk.",
      date: "Wed, Jul 2, 2026, 2:15 PM",
    },
  },
  {
    specialty: "Cardiology — Interventional",
    tag: "IMG Graduate · Competitive Specialty",
    physician: {
      name: "Dr. Rachel Stein, MD, FACC",
      title: "Director of Interventional Cardiology",
      institution: "Mount Sinai Hospital",
      city: "New York, NY",
      research: "TAVR outcomes, coronary microvascular disease, structural heart interventions",
    },
    student: {
      name: "Tariq Al-Mansouri",
      school: "University of Jordan Faculty of Medicine",
      email: "t.almansouri@ju.edu.jo",
      year: "Medical Graduate",
      credentials: "Step 1: 252 · Step 2 CK: 261 · ECFMG certified · J-1 visa holder · 2 first-author publications",
    },
    subject: "IMG, Step 2 261 — research interest in your TAVR outcomes work",
    body: `I graduated from the University of Jordan last year and am currently preparing for residency match with a focus on internal medicine leading to cardiology. Your 2024 analysis of 30-day mortality predictors post-TAVR in high-surgical-risk patients is something I've referenced repeatedly — I co-authored a case series on aortic stenosis management in our institution and your risk stratification model influenced how I framed the discussion.

I hold a J-1 visa and am currently in New York, ECFMG certified, fully vaccinated. I'm looking for a research observership where I can contribute meaningfully — I'm comfortable with data extraction, literature review, and manuscript support. Would a 10-minute call work to see if there's a fit?`,
    attachments: ["CV_Tariq_AlMansouri.pdf", "Publications_List.pdf"],
    date: "Mon, Jun 30, 2026, 11:03 AM",
    reply: {
      text: "Tariq — impressive profile. We do take motivated IMGs for research projects. Send me your CV directly and let's set something up.",
      date: "Tue, Jul 1, 2026, 9:47 AM",
    },
  },
  {
    specialty: "Neurology — Movement Disorders",
    tag: "IMG Graduate · Research Experience",
    physician: {
      name: "Dr. Priya Chandrasekaran, MD, PhD",
      title: "Assistant Professor of Neurology, Movement Disorders Program",
      institution: "Johns Hopkins Hospital",
      city: "Baltimore, MD",
      research: "Alpha-synuclein pathology, DBS programming, prodromal Parkinson's biomarkers",
    },
    student: {
      name: "Lena Hoffmann",
      school: "Charité – Universitätsmedizin Berlin",
      email: "l.hoffmann@charite.de",
      year: "Medical Graduate",
      credentials: "Step 1: 247 · Step 2 CK: 255 · ECFMG certified · Published in Movement Disorders journal · B2 visa",
    },
    subject: "Charité graduate, Step 2 255 — your alpha-synuclein biomarker work",
    body: `I graduated from Charité Berlin and published a research article in Movement Disorders on cerebrospinal fluid alpha-synuclein levels in prodromal PD — your 2024 paper on serum biomarker correlates was the most cited piece in my discussion section. The overlap between your work on early detection and my research background is specific enough that I wanted to reach out directly rather than through a general inquiry.

I'm ECFMG certified, on a B2 visa (no sponsorship needed for observership), fully vaccinated, and available from September 2026. I'd contribute as a research observer — I have experience with biomarker assay protocols and longitudinal cohort data. Would you be open to a brief conversation?`,
    attachments: ["CV_Lena_Hoffmann.pdf", "Hoffmann_MovementDisorders_2025.pdf"],
    date: "Wed, Jul 1, 2026, 7:58 AM",
    reply: {
      text: "Lena, your publication in Movement Disorders is exactly the kind of background we look for. I'll have my coordinator reach out to arrange a call.",
      date: "Thu, Jul 2, 2026, 11:22 AM",
    },
  },
];

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  const colors = ["bg-blue-100 text-blue-800", "bg-emerald-100 text-emerald-800", "bg-violet-100 text-violet-800"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

export default function ExamplesPage() {
  return (
    <div className="pt-28 pb-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-blue-800 font-semibold text-sm uppercase tracking-widest mb-3">Real examples</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">What your emails look like</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Each email is written from scratch based on the physician's actual research. No templates, no merge fields — and physicians reply.
          </p>
        </div>

        <div className="space-y-10">
          {examples.map((ex, i) => (
            <div key={i} className="card overflow-hidden">
              {/* Specialty label */}
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-blue-800 uppercase tracking-widest">{ex.specialty}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{ex.tag}</span>
                </div>
                <span className="text-xs text-gray-400 hidden sm:block">Research: {ex.physician.research}</span>
              </div>

              {/* Email header */}
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={ex.student.name} />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {ex.student.name}{" "}
                        <span className="text-gray-400 font-normal">&lt;{ex.student.email}&gt;</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">to {ex.physician.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs text-gray-400 hidden sm:block">{ex.date}</p>
                    <Star size={15} className="text-gray-300" />
                    <Reply size={15} className="text-gray-300" />
                    <Forward size={15} className="text-gray-300" />
                  </div>
                </div>

                <div className="ml-13 space-y-1">
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="w-14 text-gray-400 shrink-0">To</span>
                    <span className="text-gray-700">
                      {ex.physician.name} — {ex.physician.title}, {ex.physician.institution}, {ex.physician.city}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="w-14 text-gray-400 shrink-0">Creds</span>
                    <span className="text-gray-500">{ex.student.credentials}</span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-base font-semibold text-gray-900">{ex.subject}</p>
              </div>

              {/* Body */}
              <div className="px-5 py-5">
                {ex.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-gray-700 leading-relaxed text-sm mb-3 last:mb-0">
                    {para}
                  </p>
                ))}
                <div className="mt-4 text-sm text-gray-500">
                  <p>Best regards,</p>
                  <p className="text-gray-700 font-medium mt-0.5">{ex.student.name}</p>
                  <p className="text-gray-400">
                    {ex.student.year} · {ex.student.school}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ex.attachments.map((file, k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1"
                      >
                        <Paperclip size={11} />
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reply bar */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
                  <Reply size={12} /> Reply
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
                  <Forward size={12} /> Forward
                </button>
              </div>

              {/* Physician reply */}
              <div className="border-t-2 border-blue-100 bg-blue-50">
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={ex.physician.name} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {ex.physician.name}{" "}
                          <span className="text-xs text-blue-600 font-medium ml-1">replied</span>
                        </p>
                        <p className="text-xs text-gray-400">{ex.reply.date}</p>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">to {ex.student.name}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{ex.reply.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-gray-500 mb-6 text-lg">Ready to get emails like these written for you?</p>
          <Link
            href="/request"
            className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
          >
            Start your request <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
