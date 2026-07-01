import Link from "next/link";
import { ArrowRight, Reply, Forward, Star } from "lucide-react";

const examples = [
  {
    specialty: "Geriatric Medicine",
    physician: { name: "Dr. Sarah Chen, MD", title: "Associate Professor of Geriatrics", institution: "Northwestern Medicine", city: "Chicago, IL", research: "Frailty assessment, multimorbidity in older adults, polypharmacy" },
    student: { name: "Omar Saad", school: "Rush Medical College", email: "omar.saad@rush.edu", year: "MS3" },
    subject: "curious about your frailty research",
    body: "I've been drawn to geriatrics after my inpatient medicine rotation — your work on frailty assessment in older adults with multiple chronic conditions stood out to me in a way that felt personal rather than just academic. I'm an MS3 at Rush and have been thinking seriously about geriatrics as a fellowship direction, and I'd genuinely value your perspective on the field. Would you have 15 minutes to connect at your convenience?",
    date: "Mon, Jun 30, 2026, 9:14 AM",
  },
  {
    specialty: "Cardiology — Electrophysiology",
    physician: { name: "Dr. James Park, MD", title: "Director of Electrophysiology", institution: "University of Chicago Medicine", city: "Chicago, IL", research: "AF ablation outcomes, ventricular arrhythmias, catheter-based interventions" },
    student: { name: "Fatima Malik", school: "UIC College of Medicine", email: "f.malik@uic.edu", year: "MS4" },
    subject: "your AF ablation outcomes paper",
    body: "Your 2023 study on long-term recurrence rates after catheter ablation for persistent AF caught my attention during my cardiology rotation — I found the comparison between cryoablation and RF approaches genuinely clarifying on something I'd been confused about. I'm an MS4 at UIC considering cardiology and trying to understand what fellowship training actually looks like in EP. Would you be open to a brief conversation at your convenience?",
    date: "Mon, Jun 30, 2026, 9:17 AM",
  },
  {
    specialty: "Palliative Care",
    physician: { name: "Dr. Amara Osei, MD, MPH", title: "Palliative Care Physician", institution: "UCSF Medical Center", city: "San Francisco, CA", research: "Goals-of-care conversations, health equity in end-of-life care, advance care planning" },
    student: { name: "Priya Nair", school: "UCSF School of Medicine", email: "p.nair@ucsf.edu", year: "MS3" },
    subject: "advance care planning equity paper",
    body: "I read your research on disparities in advance care planning documentation across racial and socioeconomic groups, and it put into words something I noticed but couldn't articulate during my first ICU rotation. I'm an MS3 at UCSF who's been thinking about palliative care and would love to hear more about how you ended up in this space. If you have 15 minutes to spare, I'd genuinely appreciate it.",
    date: "Mon, Jun 30, 2026, 9:21 AM",
  },
];

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("");
  const colors = ["bg-blue-100 text-blue-800", "bg-emerald-100 text-emerald-800", "bg-violet-100 text-violet-800"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold shrink-0`}>{initials}</div>;
}

export default function ExamplesPage() {
  return (
    <div className="pt-28 pb-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-blue-800 font-semibold text-sm uppercase tracking-widest mb-3">Sample drafts</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">What your emails look like</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Each draft is written from scratch based on the physician's real research. No merge fields, no templates.</p>
        </div>

        <div className="space-y-8">
          {examples.map((ex, i) => (
            <div key={i} className="card overflow-hidden">
              {/* Specialty label */}
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-widest">{ex.specialty}</span>
                <span className="text-xs text-gray-400">Research: {ex.physician.research}</span>
              </div>

              {/* Email header — Gmail style */}
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={ex.student.name} />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{ex.student.name} <span className="text-gray-400 font-normal">&lt;{ex.student.email}&gt;</span></p>
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

                {/* Metadata rows */}
                <div className="ml-13 space-y-1 text-sm">
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="w-14 text-gray-400 shrink-0">To</span>
                    <span className="text-gray-700">{ex.physician.name} — {ex.physician.title}, {ex.physician.institution}, {ex.physician.city}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="w-14 text-gray-400 shrink-0">CC</span>
                    <span className="text-gray-400 italic">—</span>
                  </div>
                </div>
              </div>

              {/* Subject line */}
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-base font-semibold text-gray-900">{ex.subject}</p>
              </div>

              {/* Body */}
              <div className="px-5 py-5">
                <p className="text-gray-700 leading-relaxed text-sm">{ex.body}</p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Best,</p>
                  <p className="text-gray-700 font-medium mt-0.5">{ex.student.name}</p>
                  <p className="text-gray-400">{ex.student.year} | {ex.student.school}</p>
                  <p className="text-gray-400 text-xs mt-2 italic">📎 CV_attached.pdf</p>
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
