"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, X, FileText, ChevronRight, ChevronLeft, Loader2, Check, Users, AlertTriangle } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { SPECIALTIES, SUBSPECIALTIES, computeCount } from "@/lib/specialties";

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DC", name: "Washington DC" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "IA", name: "Iowa" }, { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "MA", name: "Massachusetts" }, { code: "MD", name: "Maryland" },
  { code: "ME", name: "Maine" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MO", name: "Missouri" }, { code: "MS", name: "Mississippi" }, { code: "MT", name: "Montana" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "NE", name: "Nebraska" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NV", name: "Nevada" }, { code: "NY", name: "New York" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "PR", name: "Puerto Rico" }, { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VA", name: "Virginia" }, { code: "VT", name: "Vermont" },
  { code: "WA", name: "Washington" }, { code: "WI", name: "Wisconsin" }, { code: "WV", name: "West Virginia" },
  { code: "WY", name: "Wyoming" },
];

const PURPOSES = [
  { value: "research", label: "Research opportunity", desc: "Looking to join a lab, assist with a study, or explore academic medicine" },
  { value: "elective", label: "Clinical elective", desc: "Seeking a clinical rotation in this specialty at their institution" },
  { value: "observership", label: "Observership", desc: "Requesting permission to shadow the physician in their clinic or rounds" },
  { value: "other", label: "Other / General interest", desc: "Career advice, mentorship, or exploring the specialty broadly" },
];

const ETHNICITIES = [
  { value: "any", label: "Any — no filter" },
  { value: "south_asian", label: "South Asian (Indian, Pakistani, Bangladeshi…)" },
  { value: "east_asian", label: "East / Southeast Asian (Chinese, Korean, Vietnamese…)" },
  { value: "middle_eastern", label: "Middle Eastern / Arab" },
  { value: "hispanic", label: "Hispanic / Latino" },
];

const STEPS = ["Find Physicians", "Your Info", "Letter", "Documents", "Package"];

interface FormData {
  // Step 0
  selectedSpecialties: string[];   // display labels e.g. "Internal Medicine"
  selectedSubspecialties: string[]; // exact DB values e.g. "Geriatric Medicine (Internal Medicine) Physician"
  stateMode: "all" | "include" | "exclude";
  selectedStates: string[];
  ethnicity: string;
  // Step 1
  fullName: string;
  email: string;
  medicalSchool: string;
  year: string;
  purpose: string;
  city: string;
  // Step 2
  letterOfInterest: string;
  customPrompt: string;
  // Step 3
  cvFile: File | null;
  extraFiles: File[];
  // Step 4
  plan: string;
  termsAccepted: boolean;
}

function RequestForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const cvRef = useRef<HTMLInputElement>(null);
  const extrasRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    selectedSpecialties: [],
    selectedSubspecialties: [],
    stateMode: "all",
    selectedStates: [],
    ethnicity: "any",
    fullName: "",
    email: "",
    medicalSchool: "",
    year: "MS3",
    purpose: "",
    city: "",
    letterOfInterest: "",
    customPrompt: "",
    cvFile: null,
    extraFiles: [],
    plan: searchParams.get("plan") || "standard",
    termsAccepted: false,
  });

  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Instant count from hardcoded data; switches to live API when ethnicity filter is active
  const hardcodedCount = computeCount(
    form.selectedSpecialties,
    form.selectedSubspecialties,
    form.stateMode,
    form.selectedStates,
  );
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    if (form.ethnicity === "any") {
      setLiveCount(null);
      return;
    }
    setCountLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (form.selectedSpecialties.length > 0) {
          const dbValues = form.selectedSpecialties.map(l => SPECIALTIES.find(s => s.label === l)?.dbValue || l);
          params.set("specialties", dbValues.join(","));
        }
        if (form.selectedSubspecialties.length > 0) {
          params.set("subspecialties", form.selectedSubspecialties.join(","));
        }
        if (form.stateMode !== "all" && form.selectedStates.length > 0) {
          params.set("states", form.selectedStates.join(","));
          if (form.stateMode === "exclude") params.set("excludeStates", "true");
        }
        params.set("ethnicity", form.ethnicity);
        const res = await fetch(`/api/physician-count?${params}`);
        const data = await res.json();
        setLiveCount(data.count ?? 0);
      } catch {
        setLiveCount(null);
      } finally {
        setCountLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.ethnicity, form.selectedSpecialties, form.selectedSubspecialties, form.stateMode, form.selectedStates]);

  const physicianCount = form.ethnicity !== "any" && liveCount !== null ? liveCount : hardcodedCount;

  const toggleSpecialty = (label: string) => {
    const next = form.selectedSpecialties.includes(label)
      ? form.selectedSpecialties.filter(x => x !== label)
      : [...form.selectedSpecialties, label];
    // Remove subspecialties that belong to removed specialties
    const validSubSpecialties = next.flatMap(l => (SUBSPECIALTIES[l] || []).map(s => s.dbValue));
    set("selectedSpecialties", next);
    set("selectedSubspecialties", form.selectedSubspecialties.filter(v => validSubSpecialties.includes(v)));
  };

  const toggleSubspecialty = (dbValue: string) =>
    set("selectedSubspecialties", form.selectedSubspecialties.includes(dbValue)
      ? form.selectedSubspecialties.filter(v => v !== dbValue)
      : [...form.selectedSubspecialties, dbValue]);

  const toggleState = (code: string) =>
    set("selectedStates", form.selectedStates.includes(code)
      ? form.selectedStates.filter(x => x !== code)
      : [...form.selectedStates, code]);

  const removeExtra = (idx: number) =>
    set("extraFiles", form.extraFiles.filter((_, i) => i !== idx));

  const canAdvance = (): boolean => {
    if (step === 0) return form.selectedSpecialties.length > 0 && !countLoading && physicianCount > 0;
    if (step === 1) return !!(form.fullName.trim() && form.email.trim() && form.medicalSchool.trim());
    if (step === 2) return form.letterOfInterest.trim().length >= 50;
    if (step === 3) return !!form.cvFile;
    if (step === 4) return !!form.plan && form.termsAccepted;
    return true;
  };

  const availableSubspecialties = form.selectedSpecialties.flatMap(label =>
    (SUBSPECIALTIES[label] || [])
  ).filter((s, idx, arr) => arr.findIndex(x => x.dbValue === s.dbValue) === idx);

  const filteredStates = US_STATES.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) || s.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const studentFolder = `students/${form.email.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}`;

      const cvData = new FormData();
      cvData.append("file", form.cvFile!);
      cvData.append("bucket", "cvs");
      cvData.append("folder", studentFolder);
      cvData.append("filename", "cv." + (form.cvFile!.name.split(".").pop() || "pdf"));
      const cvRes = await fetch("/api/upload", { method: "POST", body: cvData });
      if (!cvRes.ok) throw new Error("CV upload failed");
      const { url: cvUrl } = await cvRes.json();

      const extraUrls: string[] = [];
      for (let i = 0; i < form.extraFiles.length; i++) {
        const f = form.extraFiles[i];
        const fd = new FormData();
        fd.append("file", f);
        fd.append("bucket", "cvs");
        fd.append("folder", studentFolder);
        fd.append("filename", `doc_${i + 1}.${f.name.split(".").pop() || "pdf"}`);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        if (r.ok) { const { url } = await r.json(); extraUrls.push(url); }
      }

      const selectedPlan = PLANS.find(p => p.id === form.plan)!;
      const specialtyDbValues = form.selectedSpecialties
        .map(l => SPECIALTIES.find(s => s.label === l)?.dbValue || l)
        .join(", ");

      const checkoutRes = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: form.plan,
          metadata: {
            student_name: form.fullName,
            student_email: form.email,
            medical_school: form.medicalSchool,
            year: form.year,
            specialty: specialtyDbValues.slice(0, 490),
            subspecialty: form.selectedSubspecialties.join(", ").slice(0, 490),
            state: form.stateMode === "all" ? "ALL" : form.selectedStates.join(","),
            state_mode: form.stateMode,
            city: form.city || "",
            ethnicity: form.ethnicity || "any",
            letter_of_interest: form.letterOfInterest.slice(0, 490),
            custom_prompt: form.customPrompt.slice(0, 490),
            email_purpose: form.purpose,
            cv_url: cvUrl,
            extra_doc_urls: extraUrls.join(",").slice(0, 490),
            physician_count: String(selectedPlan.count),
            tier: form.plan,
            amount_paid: String(selectedPlan.price * 100),
          },
        }),
      });
      if (!checkoutRes.ok) throw new Error("Could not create checkout session");
      const { url } = await checkoutRes.json();
      window.location.href = url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find(p => p.id === form.plan);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-blue-900 text-white" : i === step ? "bg-blue-900 text-white ring-2 ring-blue-300" : "bg-gray-200 text-gray-500"}`}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 mx-1 rounded ${i < step ? "bg-blue-900" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            Step {step + 1} of {STEPS.length} — <span className="text-gray-800 font-medium">{STEPS[step]}</span>
          </p>
        </div>

        <div className="card p-8">

          {/* ── STEP 0: Find Physicians ── */}
          {step === 0 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Find your physicians</h2>
                <p className="text-gray-500 text-sm">Filter our database to see how many physicians match your target. Select at least one specialty to continue.</p>
              </div>

              {/* Physician count */}
              <div className={`flex items-center gap-3 rounded-xl px-5 py-4 border ${
                physicianCount === 0 ? "border-red-300 bg-red-50" :
                physicianCount < 30 ? "border-yellow-300 bg-yellow-50" :
                "border-blue-200 bg-blue-50"
              }`}>
                {countLoading
                  ? <Loader2 className="text-blue-600 shrink-0 animate-spin" size={22} />
                  : physicianCount === 0
                  ? <AlertTriangle className="text-red-500 shrink-0" size={22} />
                  : <Users className={physicianCount < 30 ? "text-yellow-600 shrink-0" : "text-blue-800 shrink-0"} size={22} />}
                <div>
                  {countLoading
                    ? <p className="text-blue-700 text-sm font-medium">Calculating…</p>
                    : physicianCount === 0
                    ? <p className="text-red-700 text-sm font-medium">No physicians found — try broadening your filters</p>
                    : (
                    <>
                      <p className={`font-bold text-lg ${physicianCount < 30 ? "text-yellow-700" : "text-blue-900"}`}>
                        ~{physicianCount.toLocaleString()} physicians
                      </p>
                      <p className="text-xs text-gray-500">
                        {form.selectedSpecialties.length === 0
                          ? "in our database — select a specialty to narrow"
                          : [
                              form.selectedSubspecialties.length > 0
                                ? "in your selected subspecialties"
                                : "in your selected specialties",
                              form.stateMode !== "all" && form.selectedStates.length > 0
                                ? `(${form.stateMode === "include" ? "filtered to" : "excluding"} ${form.selectedStates.length} state${form.selectedStates.length > 1 ? "s" : ""})`
                                : null,
                            ].filter(Boolean).join(" ")
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="label">Specialty <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {SPECIALTIES.map(s => (
                    <button key={s.label} type="button" onClick={() => toggleSpecialty(s.label)}
                      className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${
                        form.selectedSpecialties.includes(s.label)
                          ? "border-blue-700 bg-blue-50 text-blue-900 font-medium"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}>
                      {form.selectedSpecialties.includes(s.label) && <span className="mr-1.5">✓</span>}
                      {s.label}
                    </button>
                  ))}
                </div>
                {form.selectedSpecialties.length > 0 && (
                  <p className="text-xs text-blue-800 mt-2 font-medium">{form.selectedSpecialties.join(", ")}</p>
                )}
              </div>

              {/* Subspecialty */}
              {availableSubspecialties.length > 0 && (
                <div>
                  <label className="label">Subspecialty <span className="text-gray-400">(optional — narrows to a specific focus)</span></label>
                  <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                    {availableSubspecialties.map(sub => (
                      <button key={sub.dbValue} type="button" onClick={() => toggleSubspecialty(sub.dbValue)}
                        className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${
                          form.selectedSubspecialties.includes(sub.dbValue)
                            ? "border-blue-700 bg-blue-50 text-blue-900 font-medium"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}>
                        {form.selectedSubspecialties.includes(sub.dbValue) && <span className="mr-1.5">✓</span>}
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* State filter */}
              <div>
                <label className="label">Location</label>
                <div className="flex rounded-xl border border-gray-300 overflow-hidden mb-3 text-sm">
                  {(["all", "include", "exclude"] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => set("stateMode", mode)}
                      className={`flex-1 py-2 font-medium transition-all ${form.stateMode === mode ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      {mode === "all" ? "All states" : mode === "include" ? "Specific states" : "Exclude states"}
                    </button>
                  ))}
                </div>
                {form.stateMode !== "all" && (
                  <div>
                    <input className="input mb-2" placeholder="Search states…" value={stateSearch} onChange={e => setStateSearch(e.target.value)} />
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-44 overflow-y-auto">
                      {filteredStates.map(({ code, name }) => (
                        <button key={code} type="button" title={name} onClick={() => toggleState(code)}
                          className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${
                            form.selectedStates.includes(code)
                              ? "border-blue-700 bg-blue-50 text-blue-900 font-semibold"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}>
                          {code}
                        </button>
                      ))}
                    </div>
                    {form.selectedStates.length > 0 && (
                      <p className="text-xs text-blue-800 mt-2 font-medium">
                        {form.stateMode === "exclude" ? "Excluding" : "Including"}: {form.selectedStates.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Ethnicity */}
              <div>
                <label className="label">Physician ethnicity preference <span className="text-gray-400">(approximate — filtered by last name)</span></label>
                <div className="space-y-2">
                  {ETHNICITIES.map(e => (
                    <label key={e.value} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${form.ethnicity === e.value ? "border-blue-700 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                      <input type="radio" name="ethnicity" value={e.value} checked={form.ethnicity === e.value} onChange={() => set("ethnicity", e.value)} className="accent-blue-800" />
                      <span className="text-sm text-gray-800">{e.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Your Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Your information</h2>
                <p className="text-gray-500 text-sm">Your name will appear in every email exactly as you enter it here.</p>
              </div>
              <div>
                <label className="label">Full name (as it should appear in emails) <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Omar Saad" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
              </div>
              <div>
                <label className="label">Email address <span className="text-red-500">*</span></label>
                <input className="input" type="email" placeholder="you@medschool.edu" value={form.email} onChange={e => set("email", e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Your drafts will be sent here when ready.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Medical school / program <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="e.g. Rush Medical College" value={form.medicalSchool} onChange={e => set("medicalSchool", e.target.value)} />
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="input text-sm" value={form.year} onChange={e => set("year", e.target.value)}>
                    <optgroup label="Medical School">
                      <option value="MS1">MS1 (or equivalent)</option>
                      <option value="MS2">MS2 (or equivalent)</option>
                      <option value="MS3">MS3 (or equivalent)</option>
                      <option value="MS4">MS4 (or equivalent)</option>
                    </optgroup>
                    <optgroup label="Residency">
                      <option value="PGY1">PGY-1 / Intern (or equivalent)</option>
                      <option value="PGY2">PGY-2 (or equivalent)</option>
                      <option value="PGY3">PGY-3 (or equivalent)</option>
                      <option value="PGY4">PGY-4 (or equivalent)</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Fellow">Fellow (or equivalent)</option>
                      <option value="IMG">IMG — awaiting match</option>
                      <option value="Graduate">Graduate — not yet matched</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">City you&apos;re targeting <span className="text-gray-400">(optional)</span></label>
                <input className="input" placeholder="e.g. Chicago" value={form.city} onChange={e => set("city", e.target.value)} />
              </div>
              <div>
                <label className="label">Purpose of outreach <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-500 mb-3">This shapes how each email is framed — a research request reads very differently from an observership ask.</p>
                <div className="space-y-2">
                  {PURPOSES.map(p => (
                    <label key={p.value} className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${form.purpose === p.value ? "border-blue-700 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                      <input type="radio" name="purpose" value={p.value} checked={form.purpose === p.value} onChange={() => set("purpose", p.value)} className="accent-blue-800 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Letter ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Letter of interest</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  This is not the email itself — it&apos;s the raw material our AI uses to write something that sounds like you. The more specific you are, the better each email will be.
                </p>
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-900 space-y-1.5">
                  <p className="font-semibold">What makes emails get replies:</p>
                  <ul className="space-y-1 text-blue-800 text-xs leading-relaxed">
                    <li>• <span className="font-medium">A case you saw</span> — a patient or situation during a rotation that stuck with you and made you curious about this field</li>
                    <li>• <span className="font-medium">A specific question you have</span> — something you read or learned that you don&apos;t fully understand yet</li>
                    <li>• <span className="font-medium">What you&apos;ve done</span> — research projects, thesis work, presentations, anything relevant</li>
                    <li>• <span className="font-medium">Why this specialty</span> — not "I&apos;m passionate about it" but the actual moment or reason it clicked</li>
                  </ul>
                  <p className="text-blue-600 text-xs">The more you write, the more our AI has to connect you genuinely to each physician&apos;s specific work.</p>
                </div>
              </div>
              <div>
                <label className="label">Your letter of interest <span className="text-red-500">*</span></label>
                <textarea className="input min-h-[220px] resize-none"
                  placeholder="During my internal medicine rotation I saw a patient in her 80s who was discharged stable and back within two weeks — and nobody could explain why she deteriorated so fast. That made me want to understand how to predict who's actually high-risk at discharge. I'm also interested in frailty assessment and polypharmacy in older adults…"
                  value={form.letterOfInterest} onChange={e => set("letterOfInterest", e.target.value)} />
                <p className={`text-xs mt-1 ${form.letterOfInterest.length < 50 ? "text-gray-400" : "text-blue-800 font-medium"}`}>
                  {form.letterOfInterest.length} characters {form.letterOfInterest.length < 50 ? "(minimum 50)" : "✓"}
                </p>
              </div>
              <div>
                <label className="label">Custom instructions <span className="text-gray-400">(optional)</span></label>
                <textarea className="input min-h-[100px] resize-none"
                  placeholder="e.g. Avoid mentioning my research background. Only include physicians at academic medical centers."
                  value={form.customPrompt} onChange={e => set("customPrompt", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Documents ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Upload your documents</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Your CV is used by our AI to personalize emails. Additional documents will be listed in your drafts as recommended attachments.
                </p>
              </div>
              <div>
                <label className="label">CV / Resume <span className="text-red-500">*</span></label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${form.cvFile ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                  onClick={() => cvRef.current?.click()}>
                  <input ref={cvRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => set("cvFile", e.target.files?.[0] || null)} />
                  {form.cvFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="text-blue-700" size={24} />
                      <span className="text-blue-800 font-medium">{form.cvFile.name}</span>
                      <button className="text-gray-400 hover:text-red-500 ml-2" onClick={e => { e.stopPropagation(); set("cvFile", null); }}><X size={16} /></button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-3" size={28} />
                      <p className="text-gray-600 font-medium">Click to upload your CV</p>
                      <p className="text-gray-400 text-sm mt-1">PDF, DOC, or DOCX</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="label">Additional documents <span className="text-gray-400">(optional)</span></label>
                <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  onClick={() => extrasRef.current?.click()}>
                  <input ref={extrasRef} type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={e => set("extraFiles", [...form.extraFiles, ...Array.from(e.target.files || [])])} />
                  <Upload className="mx-auto text-gray-400 mb-2" size={22} />
                  <p className="text-gray-500 text-sm">Vaccination records, HIPAA certificate, letters, etc.</p>
                </div>
                {form.extraFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {form.extraFiles.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{f.name}</span>
                        <button className="text-gray-400 hover:text-red-500" onClick={() => removeExtra(i)}><X size={14} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: Package ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your package</h2>
                <p className="text-gray-500 text-sm">More emails = higher chance of a reply.</p>
              </div>
              <div className="space-y-3">
                {PLANS.map(plan => (
                  <div key={plan.id}
                    className={`border rounded-xl p-5 cursor-pointer transition-all ${form.plan === plan.id ? "border-blue-700 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                    onClick={() => set("plan", plan.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.plan === plan.id ? "border-blue-700" : "border-gray-400"}`}>
                          {form.plan === plan.id && <div className="w-2 h-2 rounded-full bg-blue-700" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{plan.name} — {plan.count} email drafts</p>
                          <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xl font-bold text-gray-900">${plan.price}</p>
                        {plan.popular && <p className="text-xs text-blue-800 font-semibold">Most popular</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm space-y-2">
                <p className="font-semibold text-gray-800 mb-3">Order summary</p>
                {[
                  ["Name", form.fullName],
                  ["Specialty", form.selectedSpecialties.join(", ") || "—"],
                  ["Purpose", PURPOSES.find(p => p.value === form.purpose)?.label || "—"],
                  ["Location", [form.city, form.stateMode === "all" ? "All states" : form.selectedStates.join(", ")].filter(Boolean).join(", ") || "All states"],
                  ["Package", `${selectedPlan?.count} drafts`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-gray-600">
                    <span>{k}</span><span className="text-gray-900 text-right ml-4 max-w-[55%] truncate">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span><span>${selectedPlan?.price}</span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 accent-blue-800 shrink-0"
                  checked={form.termsAccepted}
                  onChange={e => set("termsAccepted", e.target.checked)}
                />
                <span className="text-sm text-gray-600">
                  I have read and agree to the{" "}
                  <a href="/terms" target="_blank" className="text-blue-800 hover:underline font-medium">Terms of Service</a>.
                  I understand that IMG Outreach delivers email drafts and cannot guarantee physician replies.
                </span>
              </label>

              {error && <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className={`flex mt-8 gap-3 ${step === 0 ? "justify-end" : "justify-between"}`}>
            {step > 0 && (
              <button className="btn-outline flex items-center gap-2" onClick={() => setStep(step - 1)} disabled={loading}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-primary flex items-center gap-2" onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn-primary flex items-center gap-2 min-w-[160px] justify-center" onClick={handleSubmit} disabled={!canAdvance() || loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <>Pay & Get Drafts <ChevronRight size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return <Suspense><RequestForm /></Suspense>;
}
