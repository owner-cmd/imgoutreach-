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
      research: "Frailty and 30-day readmission risk in older adults on 5+ medications",
    },
    student: {
      name: "Aisha Karimi",
      school: "Aga Khan University",
      email: "a.karimi@aku.edu",
      year: "MS3",
      credentials: "Step 2 CK: 248 · ECFMG certified · Completed internal medicine rotation at UIC",
    },
    subject: "observership — Aga Khan MS3, Step 2 248",
    body: `I'm an MS3 at Aga Khan who just finished an internal medicine rotation at UIC. I kept seeing the same thing: elderly patients on 10 medications, medically stable at discharge, back within two weeks. Nobody on the team had a good answer for who was actually high-risk. I found your 2023 paper on frailty phenotyping afterward and it explained exactly what I'd been watching happen — the phenotype score predicted readmission better than diagnosis count or lab values alone.

I'm ECFMG certified, available January–March 2027, and attached my CV. Would a short call work, or would you be open to an observership directly?`,
    attachments: ["CV_Aisha_Karimi.pdf"],
    date: "Tue, Jul 1, 2026, 8:42 AM",
    reply: {
      text: "Aisha — saw your CV, the UIC rotation helps. February works. Send me a few times that work for a call.",
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
      research: "Predicting 30-day mortality after TAVR in patients too high-risk for open surgery",
    },
    student: {
      name: "Tariq Al-Mansouri",
      school: "University of Jordan Faculty of Medicine",
      email: "t.almansouri@ju.edu.jo",
      year: "Medical Graduate",
      credentials: "Step 1: 252 · Step 2 CK: 261 · ECFMG certified · J-1 visa · 2 first-author publications in cardiology",
    },
    subject: "cardiology research — U of Jordan grad, Step 2 261",
    body: `I graduated from the University of Jordan last year and published a case series on severe aortic stenosis in surgical-risk patients. Writing the discussion was harder than I expected — deciding when TAVR was the right call versus ongoing medical management wasn't straightforward. I came across your 2024 paper on 30-day mortality predictors post-TAVR and ended up citing it; the albumin and STS score combination made more clinical sense than anything else I'd found.

I'm ECFMG certified, in New York on a J-1 visa, and genuinely interested in getting involved in your outcomes work. CV and publication list attached — would a quick call work?`,
    attachments: ["CV_Tariq_AlMansouri.pdf", "Publications_List.pdf"],
    date: "Mon, Jun 30, 2026, 11:03 AM",
    reply: {
      text: "Tariq — read your paper. The way you handled the STS framing was solid. We have something you could contribute to. Let's talk this week.",
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
      research: "Blood-based biomarkers for detecting Parkinson's disease before symptoms appear",
    },
    student: {
      name: "Lena Hoffmann",
      school: "Charité – Universitätsmedizin Berlin",
      email: "l.hoffmann@charite.de",
      year: "Medical Graduate",
      credentials: "Step 1: 247 · Step 2 CK: 255 · ECFMG certified · Published in Movement Disorders journal · B2 visa, no sponsorship needed",
    },
    subject: "Parkinson's biomarker research — Charité grad, Step 2 255",
    body: `I'm a Charité Berlin graduate with a published study in Movement Disorders on CSF alpha-synuclein in REM sleep behavior disorder patients. The frustrating part of that work was the lumbar puncture — most patients we wanted to follow longitudinally just wouldn't do it repeatedly. Your 2024 paper on serum phosphorylated alpha-synuclein correlating with CSF findings in the same prodromal group is the direction that study needed to go, and I've been thinking about it since.

I'm ECFMG certified, on a B2 visa, available from September. CV and the paper attached — would you be open to a call?`,
    attachments: ["CV_Lena_Hoffmann.pdf", "Hoffmann_MovementDisorders_2025.pdf"],
    date: "Wed, Jul 1, 2026, 7:58 AM",
    reply: {
      text: "Lena — we're actually recruiting that exact REM behavior disorder population right now for a validation cohort. Let's talk. My coordinator will reach out.",
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
