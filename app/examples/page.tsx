import Link from "next/link";
import { ArrowRight, Reply, Forward, Star, Paperclip } from "lucide-react";

const examples = [
  {
    specialty: "Neurology — Stroke & Neuroplasticity",
    tag: "MS4 · IMG",
    physician: {
      name: "Dr. Elena Vasquez, MD, PhD",
      title: "Associate Professor of Neurology, Stroke Program",
      institution: "University of Michigan Health",
      city: "Ann Arbor, MI",
      research: "Cortical reorganization and motor recovery after ischemic stroke",
    },
    student: {
      name: "Dina Saleh",
      school: "Cairo University Faculty of Medicine",
      email: "d.saleh@cu.edu.eg",
      year: "MS4",
    },
    subject: "neurology observership — Cairo MS4, Step 1 passed",
    body: `I'm an MS4 at Cairo University interested in neuroplasticity — specifically what drives meaningful motor recovery in some stroke patients and not others. I came across your 2023 paper on cortical remapping after ischemic stroke and the finding that reorganization window is widest in the first 90 days was new to me; I hadn't seen that framed so precisely anywhere else.

I'm ECFMG certified, Step 1 passed, available from March 2027. CV attached — would an observership be possible, or would a quick call make more sense?`,
    attachments: ["CV_Dina_Saleh.pdf"],
    date: "Tue, Jul 1, 2026, 9:05 AM",
    reply: {
      text: "Dina — March works. Let's do a call first. Send me two or three times that work for you.",
      date: "Wed, Jul 2, 2026, 3:40 PM",
    },
  },
  {
    specialty: "Psychiatry — Mood Disorders",
    tag: "IMG Graduate · Competitive Specialty",
    physician: {
      name: "Dr. Marcus Webb, MD",
      title: "Director, Treatment-Resistant Depression Program",
      institution: "Yale School of Medicine",
      city: "New Haven, CT",
      research: "Ketamine and rapid antidepressant mechanisms in treatment-resistant depression",
    },
    student: {
      name: "Fatima Al-Rashidi",
      school: "Kuwait University College of Medicine",
      email: "f.alrashidi@ku.edu.kw",
      year: "Medical Graduate",
    },
    subject: "psychiatry research — Kuwait grad, Step 1 passed, Step 2 253",
    body: `I graduated from Kuwait University last year and I'm interested in treatment-resistant depression — specifically why some patients stop responding to antidepressants entirely. I've been reading into ketamine and your 2024 paper on glutamate rebound suppression was the clearest explanation I've found for why the response timeline is so different from conventional antidepressants.

I'm ECFMG certified, Step 2 253, and interested in your outcomes research. CV attached — would a short call work?`,
    attachments: ["CV_Fatima_AlRashidi.pdf"],
    date: "Mon, Jun 30, 2026, 10:18 AM",
    reply: {
      text: "Fatima — good timing, we're starting a new ketamine cohort in the fall. Let's talk. I'll have my coordinator reach out.",
      date: "Tue, Jul 1, 2026, 2:05 PM",
    },
  },
  {
    specialty: "Endocrinology — Thyroid Cancer",
    tag: "IMG Graduate · Research Experience",
    physician: {
      name: "Dr. Jonathan Park, MD, FACE",
      title: "Chief of Endocrinology",
      institution: "MD Anderson Cancer Center",
      city: "Houston, TX",
      research: "Radioiodine resistance mechanisms in differentiated thyroid cancer",
    },
    student: {
      name: "Valentina Cruz",
      school: "Universidad Nacional Autónoma de México",
      email: "v.cruz@unam.mx",
      year: "Medical Graduate",
    },
    subject: "thyroid cancer research — UNAM grad, Step 1 passed, Step 2 249",
    body: `I'm a UNAM graduate who spent a year on an endocrinology research project looking at recurrence patterns in differentiated thyroid cancer. The cases that stayed with me were patients who responded to initial radioiodine but then didn't on the second course — nobody had a good framework for predicting that shift. Your 2023 paper on BRAF V600E as a resistance predictor is exactly what was missing from our analysis; I've been following your group's work since.

I'm ECFMG certified, Step 2 249, available from October. CV and a research summary attached — would you be open to a call?`,
    attachments: ["CV_Valentina_Cruz.pdf", "Research_Summary.pdf"],
    date: "Wed, Jul 1, 2026, 8:33 AM",
    reply: {
      text: "Valentina — the BRAF work is central to what we're doing now. Send your CV directly and let's find a time.",
      date: "Thu, Jul 2, 2026, 10:55 AM",
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
            Each email references the physician's actual research and explains why it connects to what the student has already done. Physicians notice the difference.
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
                <span className="text-xs text-gray-400 hidden sm:block italic">{ex.physician.research}</span>
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

                <div className="ml-13">
                  <div className="flex gap-2 text-xs">
                    <span className="w-14 text-gray-400 shrink-0">To</span>
                    <span className="text-gray-700">
                      {ex.physician.name} — {ex.physician.title}, {ex.physician.institution}, {ex.physician.city}
                    </span>
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
                  <p className="text-gray-700 font-medium">{ex.student.name}</p>
                  <p className="text-gray-400">{ex.student.year} · {ex.student.school}</p>
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
              <div className="border-t-2 border-emerald-100 bg-emerald-50">
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={ex.physician.name} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {ex.physician.name}{" "}
                          <span className="text-xs text-emerald-600 font-medium ml-1">↩ replied</span>
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
          <Link href="/request" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Start your request <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
