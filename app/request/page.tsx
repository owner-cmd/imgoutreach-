"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, X, FileText, ChevronRight, ChevronLeft, Loader2, Check, Users, AlertTriangle } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { SPECIALTIES, SUBSPECIALTIES, computeCount, genderMultiplier } from "@/lib/specialties";
import { MED_SCHOOLS, OTHER_SCHOOL } from "@/lib/medSchools";
import { US_CITIES } from "@/lib/usCities";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

// Free trial is a pseudo-plan: no Stripe, 25 drafts, no ethnicity targeting.
const TRIAL_PLAN = { id: "trial", name: "Free Trial", count: 25, price: 0, description: "25 personalized drafts — free, no card required" };

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
  { value: "any", label: "Any — no preference" },
  { value: "south_asian", label: "South Asian (Indian, Pakistani, Bangladeshi…)" },
  { value: "east_asian", label: "East / Southeast Asian (Chinese, Korean, Vietnamese…)" },
  { value: "middle_eastern", label: "Middle Eastern and North African" },
  { value: "hispanic", label: "Hispanic / Latino" },
];

// Gmail access is granted during Google sign-in (the gate after step 0), so there
// is no separate "Connect Gmail" step here.
const STEPS = ["Find Physicians", "Your Info", "Letter", "Documents", "Package"];

interface FormData {
  // Step 0
  selectedSpecialties: string[];   // display labels e.g. "Internal Medicine"
  selectedSubspecialties: string[]; // exact DB values e.g. "Geriatric Medicine (Internal Medicine) Physician"
  stateMode: "all" | "include" | "exclude";
  selectedStates: string[];
  ethnicity: string;
  gender: string;
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  medicalSchool: string;
  year: string;
  purposes: string[];
  otherPurpose: string;
  selectedCities: string[];
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

const PREAUTH_KEY = "imgoutreach_preauth_id";

function getPreauthId(): string {
  try {
    const existing = localStorage.getItem(PREAUTH_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(PREAUTH_KEY, id);
    return id;
  } catch { return crypto.randomUUID(); }
}

function RequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [subspecialtySearch, setSubspecialtySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [preauthId, setPreauthId] = useState("");
  const [triedToAdvance, setTriedToAdvance] = useState(false);
  const [schoolChoice, setSchoolChoice] = useState("");
  const [promoCode, setPromoCode] = useState("");
  // Signed-in user (Google via Supabase). Needed to claim the free trial and to
  // save their info for next time.
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);
  const cvRef = useRef<HTMLInputElement>(null);
  const extrasRef = useRef<HTMLInputElement>(null);

  const SAVE_KEY = "imgoutreach_form_draft";

  const [form, setForm] = useState<FormData>({
    selectedSpecialties: [],
    selectedSubspecialties: [],
    stateMode: "all",
    selectedStates: [],
    ethnicity: "any",
    gender: "any",
    firstName: "",
    lastName: "",
    email: "",
    medicalSchool: "",
    year: "",
    purposes: [],
    otherPurpose: "",
    selectedCities: [],
    letterOfInterest: "",
    customPrompt: "",
    cvFile: null,
    extraFiles: [],
    plan: "standard",
    termsAccepted: false,
  });

  // Load localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved) {
        setForm(prev => ({
          ...prev,
          selectedSpecialties: saved.selectedSpecialties ?? prev.selectedSpecialties,
          selectedSubspecialties: saved.selectedSubspecialties ?? prev.selectedSubspecialties,
          stateMode: saved.stateMode ?? prev.stateMode,
          selectedStates: saved.selectedStates ?? prev.selectedStates,
          ethnicity: saved.ethnicity ?? prev.ethnicity,
          gender: saved.gender ?? prev.gender,
          firstName: saved.firstName ?? prev.firstName,
          lastName: saved.lastName ?? prev.lastName,
          email: saved.email ?? prev.email,
          medicalSchool: saved.medicalSchool ?? prev.medicalSchool,
          year: saved.year ?? prev.year,
          purposes: saved.purposes ?? prev.purposes,
          otherPurpose: saved.otherPurpose ?? prev.otherPurpose,
          selectedCities: saved.selectedCities ?? prev.selectedCities,
          letterOfInterest: saved.letterOfInterest ?? prev.letterOfInterest,
          customPrompt: saved.customPrompt ?? prev.customPrompt,
          plan: searchParams.get("plan") || saved.plan || prev.plan,
        }));
        if (saved.medicalSchool) {
          const known = MED_SCHOOLS.some(g => g.schools.includes(saved.medicalSchool));
          setSchoolChoice(known ? saved.medicalSchool : OTHER_SCHOOL);
        }
      } else {
        const planParam = searchParams.get("plan");
        if (planParam) setForm(prev => ({ ...prev, plan: planParam }));
      }
    } catch { /* ignore */ }

    const id = getPreauthId();
    setPreauthId(id);
    if (searchParams.get("resume") === "1") {
      // Returned from sign-in (which also granted Gmail) — resume at Your Info.
      setStep(1);
      router.replace("/request");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Load the Google session (if any) so we know whether the free trial is offered.
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(async ({ data }) => {
      const accessToken = data.session?.access_token ?? null;
      setAuthEmail(data.session?.user?.email ?? null);
      setAuthToken(accessToken);
      setAuthReady(true);
      // If this account already used its free trial, hide the trial option and
      // make paid the only choice.
      if (accessToken) {
        try {
          const res = await fetch("/api/trial-status", { headers: { Authorization: `Bearer ${accessToken}` } });
          const j = await res.json();
          if (j.used) {
            setTrialUsed(true);
            setForm(prev => (prev.plan === "trial" ? { ...prev, plan: "standard" } : prev));
          }
        } catch { /* non-blocking */ }
      }
    });
  }, []);

  // Autosave to localStorage on every form change (skip files — not serializable)
  useEffect(() => {
    const { cvFile, extraFiles, termsAccepted, ...saveable } = form;
    void cvFile; void extraFiles; void termsAccepted;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveable)); } catch { /* ignore */ }
  }, [form]);

  // Exact hardcoded count (specialty × state × gender). No DB call, no approximation.
  // Switches to live API only when the ethnicity filter is active.
  const exactCount = computeCount(
    form.selectedSpecialties,
    form.selectedSubspecialties,
    form.stateMode,
    form.selectedStates,
    form.gender,
  );
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [preferredMatch, setPreferredMatch] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  // Only ethnicity hits the live DB (it improves as enrichment runs).
  // Specialty and gender are computed from hardcoded data.
  const usesLiveCount = form.ethnicity !== "any";

  useEffect(() => {
    if (!usesLiveCount) {
      setLiveCount(null);
      setPreferredMatch(null);
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
        if (form.ethnicity !== "any") params.set("ethnicity", form.ethnicity);
        const res = await fetch(`/api/physician-count?${params}`);
        const data = await res.json();
        setLiveCount(data.count ?? 0);
        setPreferredMatch(typeof data.preferredCount === "number" ? data.preferredCount : null);
      } catch {
        setLiveCount(null);
        setPreferredMatch(null);
      } finally {
        setCountLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [usesLiveCount, form.ethnicity, form.selectedSpecialties, form.selectedSubspecialties, form.stateMode, form.selectedStates]);

  // No ethnicity filter → fully exact hardcoded count (specialty × state × gender).
  // Ethnicity filter → live specialty+ethnicity+state count, with the gender ratio
  // applied on top (ethnicity×gender isn't in the exact table, so this stays an estimate).
  const physicianCount = usesLiveCount && liveCount !== null
    ? Math.round(liveCount * genderMultiplier(form.gender, form.selectedSpecialties, form.selectedSubspecialties))
    : exactCount;

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
    if (step === 1) return !!(
      form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.medicalSchool.trim() &&
      (!form.purposes.includes("other") || form.otherPurpose.trim())
    );
    if (step === 2) return form.letterOfInterest.trim().length >= 50;
    if (step === 3) return !!form.cvFile;
    if (step === 4) return !!form.plan && form.termsAccepted;
    return true;
  };

  const availableSubspecialties = form.selectedSpecialties.flatMap(label =>
    (SUBSPECIALTIES[label] || [])
  ).filter((s, idx, arr) => arr.findIndex(x => x.dbValue === s.dbValue) === idx)
   .sort((a, b) => a.label.localeCompare(b.label));

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

      const isTrial = form.plan === "trial";
      const selectedPlan = isTrial ? TRIAL_PLAN : PLANS.find(p => p.id === form.plan)!;
      const specialtyDbValues = form.selectedSpecialties
        .map(l => SPECIALTIES.find(s => s.label === l)?.dbValue || l)
        .join(", ");

      const metadata = {
            student_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
            student_email: form.email,
            medical_school: form.medicalSchool,
            year: form.year,
            specialty: specialtyDbValues.slice(0, 490),
            subspecialty: form.selectedSubspecialties.join(", ").slice(0, 490),
            state: form.stateMode === "all" ? "ALL" : form.selectedStates.join(","),
            state_mode: form.stateMode,
            city: form.selectedCities.join(", "),
            ethnicity: form.ethnicity || "any",
            gender: form.gender || "any",
            letter_of_interest: form.letterOfInterest.slice(0, 490),
            custom_prompt: form.customPrompt.slice(0, 490),
            email_purpose: form.purposes
              .map(v => (v === "other" && form.otherPurpose.trim() ? `other (${form.otherPurpose.trim()})` : v))
              .join(", "),
            cv_url: cvUrl,
            extra_doc_urls: extraUrls.join(",").slice(0, 490),
            physician_count: String(selectedPlan.count),
            tier: form.plan,
            amount_paid: String(selectedPlan.price * 100),
            preauth_id: preauthId,
      };

      if (isTrial) {
        // Free trial: no Stripe. The API verifies the Google session, enforces
        // one-trial-per-account + per-info, saves the order and starts the workflow.
        const res = await fetch("/api/free-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken || ""}` },
          body: JSON.stringify({ metadata }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data.error || "Could not start your free trial.") + (data.detail ? ` (${data.detail})` : ""));
        try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
        window.location.href = `/success?session_id=${encodeURIComponent(data.sessionId)}`;
        return;
      }

      const checkoutRes = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: form.plan, promoCode: promoCode.trim() || null, metadata }),
      });
      if (!checkoutRes.ok) throw new Error("Could not create checkout session");
      const { url } = await checkoutRes.json();
      try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
      window.location.href = url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const selectedPlan = form.plan === "trial" ? TRIAL_PLAN : PLANS.find(p => p.id === form.plan);

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

              {/* Physician count — pinned to top while scrolling filters */}
              <div className={`sticky top-16 z-30 flex items-center gap-3 rounded-xl px-5 py-4 border shadow-sm ${
                physicianCount === 0 ? "border-red-300 bg-red-50" :
                physicianCount < 30 ? "border-yellow-300 bg-yellow-50" :
                "border-blue-200 bg-blue-50"
              }`}>
                {countLoading
                  ? <Loader2 className="text-blue-600 shrink-0 animate-spin" size={22} />
                  : physicianCount === 0
                  ? <AlertTriangle className="text-red-500 shrink-0" size={22} />
                  : <Users className={physicianCount < 30 ? "text-yellow-600 shrink-0" : "text-blue-800 shrink-0"} size={22} />}
                <div className="min-w-0">
                  {countLoading
                    ? <p className="text-blue-700 text-sm font-medium">Calculating…</p>
                    : physicianCount === 0
                    ? <p className="text-red-700 text-sm font-medium">No physicians found — try broadening your filters</p>
                    : (
                    <>
                      <p className={`font-bold text-lg ${physicianCount < 30 ? "text-yellow-700" : "text-blue-900"}`}>
                        ~{physicianCount.toLocaleString()} physicians
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {form.selectedSpecialties.length === 0
                          ? "in our database — select a specialty to narrow"
                          : [
                              form.selectedSubspecialties.length > 0
                                ? form.selectedSubspecialties.length + " subspecialt" + (form.selectedSubspecialties.length > 1 ? "ies" : "y")
                                : form.selectedSpecialties.join(", "),
                              form.stateMode !== "all" && form.selectedStates.length > 0
                                ? `${form.stateMode === "include" ? "" : "excl. "}${form.selectedStates.join(", ")}`
                                : null,
                              form.gender === "M" ? "male" : form.gender === "F" ? "female" : null,
                            ].filter(Boolean).join(" · ")
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Specialty — searchable, with selected shown as removable chips */}
              <div>
                <label className="label">Specialty <span className="text-red-500">*</span></label>
                {form.selectedSpecialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.selectedSpecialties.map(label => (
                      <span key={label} className="flex items-center gap-1 bg-blue-100 text-blue-900 text-xs font-medium px-2 py-1 rounded-md">
                        {label}
                        <button type="button" aria-label={`Remove ${label}`} onClick={() => toggleSpecialty(label)} className="p-1.5 -m-1 hover:text-blue-700"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  className="input mb-2"
                  placeholder="Search specialties…"
                  value={specialtySearch}
                  onChange={e => setSpecialtySearch(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {[...SPECIALTIES]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .filter(s => s.label.toLowerCase().includes(specialtySearch.toLowerCase()))
                    .map(s => (
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
              </div>

              {/* Subspecialty — searchable, with selected shown as removable chips */}
              {availableSubspecialties.length > 0 && (
                <div>
                  <label className="label">Subspecialty <span className="text-gray-400">(optional — narrows to a specific focus)</span></label>
                  {form.selectedSubspecialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.selectedSubspecialties.map(dbValue => {
                        const sub = availableSubspecialties.find(s => s.dbValue === dbValue);
                        if (!sub) return null;
                        return (
                          <span key={dbValue} className="flex items-center gap-1 bg-blue-100 text-blue-900 text-xs font-medium px-2 py-1 rounded-md">
                            {sub.label}
                            <button type="button" aria-label={`Remove ${sub.label}`} onClick={() => toggleSubspecialty(dbValue)} className="p-1.5 -m-1 hover:text-blue-700"><X size={14} /></button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <input
                    className="input mb-2"
                    placeholder="Search subspecialties…"
                    value={subspecialtySearch}
                    onChange={e => setSubspecialtySearch(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {availableSubspecialties
                      .filter(sub => sub.label.toLowerCase().includes(subspecialtySearch.toLowerCase()))
                      .map(sub => (
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

              {/* Gender */}
              <div>
                <label className="label">Physician gender preference <span className="text-gray-400">(optional)</span></label>
                <div className="flex rounded-xl border border-gray-300 overflow-hidden text-sm">
                  {([
                    { value: "any", label: "Any" },
                    { value: "M", label: "Male" },
                    { value: "F", label: "Female" },
                  ] as const).map(g => (
                    <button key={g.value} type="button" onClick={() => set("gender", g.value)}
                      className={`flex-1 py-2 font-medium transition-all ${form.gender === g.value ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ethnicity — a PREFERENCE, not a hard filter; paid plans only */}
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <label className="label mb-0">Preferred physician ethnicity <span className="text-gray-400">(a preference, not a filter)</span></label>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                    Paid plans
                  </span>
                </div>
                <select
                  className="input text-sm"
                  value={form.ethnicity}
                  onChange={e => set("ethnicity", e.target.value)}
                >
                  {ETHNICITIES.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Matching physicians are <span className="font-medium">prioritized first</span> — it never reduces your order. Free-trial orders always use &quot;Any&quot;.
                </p>
                {form.ethnicity !== "any" && preferredMatch !== null && !countLoading && (
                  <p className="text-xs mt-1.5 text-blue-800">
                    ~{preferredMatch.toLocaleString()} of your target match this preference — prioritized first, the rest filled with other strong matches.
                  </p>
                )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First name <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="First name" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                </div>
                <div>
                  <label className="label">Last name <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="Last name" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Email address <span className="text-red-500">*</span></label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Personal or school email — either is fine. Your drafts are sent here when ready.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Medical school / program <span className="text-red-500">*</span></label>
                  <select
                    className="input text-sm"
                    value={schoolChoice}
                    onChange={e => {
                      const v = e.target.value;
                      setSchoolChoice(v);
                      set("medicalSchool", v === OTHER_SCHOOL ? "" : v);
                    }}
                  >
                    <option value="" disabled>Select your school…</option>
                    {MED_SCHOOLS.map(group => (
                      <optgroup key={group.country} label={group.country}>
                        {group.schools.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option value={OTHER_SCHOOL}>{OTHER_SCHOOL}</option>
                  </select>
                  {schoolChoice === OTHER_SCHOOL && (
                    <input
                      className="input mt-2"
                      placeholder="Type your medical school's full name"
                      value={form.medicalSchool}
                      onChange={e => set("medicalSchool", e.target.value)}
                    />
                  )}
                </div>
                <div>
                  <label className="label">Stage of training</label>
                  <select className="input text-sm" value={form.year} onChange={e => set("year", e.target.value)}>
                    <option value="" disabled>Select your stage…</option>
                    <optgroup label="Medical school (any program length)">
                      <option value="Pre-clinical">Pre-clinical (basic sciences / classroom)</option>
                      <option value="Clinical">Clinical years (clerkships / rotations)</option>
                      <option value="Final year">Final year (graduating soon)</option>
                    </optgroup>
                    <optgroup label="After medical school">
                      <option value="Graduated">Graduated — applying</option>
                      <option value="Internship">Internship / House officer</option>
                      <option value="Resident">Resident</option>
                      <option value="Fellow">Fellow</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Pick where you are — this works whatever your program length.</p>
                </div>
              </div>
              <div>
                <label className="label">Cities you&apos;re targeting <span className="text-gray-400">(optional — a preference, add as many as you like)</span></label>
                {form.selectedCities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.selectedCities.map(c => (
                      <span key={c} className="flex items-center gap-1 bg-blue-100 text-blue-900 text-xs font-medium px-2 py-1 rounded-md">
                        {c}
                        <button type="button" aria-label={`Remove ${c}`} onClick={() => set("selectedCities", form.selectedCities.filter(x => x !== c))} className="p-1.5 -m-1 hover:text-blue-700"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  className="input mb-2"
                  placeholder="Search US cities…"
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                />
                {citySearch.trim() && (
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                    {US_CITIES
                      .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()) && !form.selectedCities.includes(c))
                      .slice(0, 40)
                      .map(c => (
                        <button key={c} type="button"
                          onClick={() => { set("selectedCities", [...form.selectedCities, c]); setCitySearch(""); }}
                          className="text-left text-sm px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-all">
                          {c}
                        </button>
                      ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1.5">Physicians in these cities are prioritized first — it never reduces your order.</p>
              </div>
              <div>
                <label className="label">Purpose of outreach <span className="text-gray-400">(select all that apply)</span></label>
                <p className="text-xs text-gray-500 mb-3">This shapes how each email is framed — a research request reads very differently from an observership ask.</p>
                <div className="space-y-2">
                  {PURPOSES.map(p => {
                    const checked = form.purposes.includes(p.value);
                    return (
                      <label key={p.value} className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${checked ? "border-blue-700 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}>
                        <input
                          type="checkbox"
                          value={p.value}
                          checked={checked}
                          onChange={() => set("purposes", checked ? form.purposes.filter(v => v !== p.value) : [...form.purposes, p.value])}
                          className="accent-blue-800 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {form.purposes.includes("other") && (
                  <div className="mt-3">
                    <label className="label">What are you hoping for? <span className="text-red-500">*</span></label>
                    <input
                      className="input"
                      placeholder="e.g. mentorship on applying to US residency, or advice on breaking into this specialty"
                      value={form.otherPurpose}
                      onChange={e => set("otherPurpose", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Letter ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Letter of interest</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  This is the raw material our AI writes each email from — write about <span className="font-medium text-gray-700">you</span>, and we handle personalizing it to each physician. Rough notes are fine.
                </p>
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">What to include</p>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    <li>• <span className="font-medium text-gray-800">Your interests</span> — what genuinely draws you to this field</li>
                    <li>• <span className="font-medium text-gray-800">A story or moment</span> — a case or experience that hooked you</li>
                    <li>• <span className="font-medium text-gray-800">Your credentials</span> — achievements, research, projects, exam scores</li>
                    <li>• <span className="font-medium text-gray-800">What you can offer</span> — skills, availability, how you can help</li>
                  </ul>
                  {form.purposes.includes("research") ? (
                    <p className="text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-3 leading-relaxed">
                      <span className="font-semibold">Since you want research:</span> be specific and niche. &quot;Predicting heart-failure readmissions&quot; beats &quot;cardiology.&quot; The narrower your interest, the better we match physicians working on exactly that — and research-heavy specialties (neurology, oncology, cardiology…) reward that specificity most.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 mt-3 leading-relaxed">
                      For observerships and electives, you don&apos;t need a niche research topic — genuine interest, a relevant experience, and your availability matter most.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="label">Your letter of interest <span className="text-red-500">*</span></label>
                <textarea className="input min-h-[220px] resize-none"
                  placeholder="Rough notes are fine. e.g. Saw an 80yo readmitted 2 weeks after a stable discharge — nobody could explain it. Want to understand who's actually high-risk at discharge. Also into frailty + polypharmacy in older adults."
                  value={form.letterOfInterest} onChange={e => set("letterOfInterest", e.target.value)} />
                <p className={`text-xs mt-1 ${form.letterOfInterest.length < 50 ? "text-gray-400" : "text-blue-800 font-medium"}`}>
                  {form.letterOfInterest.length} characters {form.letterOfInterest.length < 50 ? "(minimum 50)" : "✓"}
                </p>
              </div>
              <div>
                <label className="label">Anything you&apos;d like mentioned <span className="text-gray-400">(optional)</span></label>
                <textarea className="input min-h-[90px] resize-none"
                  placeholder="e.g. I can help with research, data collection, or statistics. I have a green card / I don't need a visa. Available to start this summer."
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
                {/* Free trial — signed-in users who haven't used it yet; one per account */}
                {authEmail && !trialUsed && (
                  <div
                    className={`border rounded-xl p-5 cursor-pointer transition-all ${form.plan === "trial" ? "border-emerald-600 bg-emerald-50" : "border-emerald-300 bg-emerald-50/40 hover:border-emerald-500"}`}
                    onClick={() => set("plan", "trial")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.plan === "trial" ? "border-emerald-600" : "border-gray-400"}`}>
                          {form.plan === "trial" && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{TRIAL_PLAN.name} — {TRIAL_PLAN.count} email drafts</p>
                          <p className="text-xs text-gray-500 mt-0.5">{TRIAL_PLAN.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Ethnicity preference matching and AI draft editing are on paid plans.</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-xl font-bold text-emerald-700">$0</p>
                        <p className="text-xs text-emerald-700 font-semibold">One per account</p>
                      </div>
                    </div>
                    {form.plan === "trial" && form.ethnicity !== "any" && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                        You picked an ethnicity preference — that&apos;s a paid feature, so this trial will use &quot;Any&quot;.
                      </p>
                    )}
                  </div>
                )}
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

              {/* Promo code */}
              <div>
                <label className="label">Have a promo code?</label>
                <input
                  className="input"
                  placeholder="Enter code (optional)"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm space-y-2">
                <p className="font-semibold text-gray-800 mb-3">Order summary</p>
                {[
                  ["Name", `${form.firstName} ${form.lastName}`.trim() || "—"],
                  ["Specialty", form.selectedSpecialties.join(", ") || "—"],
                  ["Purpose", form.purposes.map(v => PURPOSES.find(p => p.value === v)?.label).filter(Boolean).join(", ") || "—"],
                  ["Location", [form.selectedCities.join(", "), form.stateMode === "all" ? "All states" : form.selectedStates.join(", ")].filter(Boolean).join(", ") || "All states"],
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
              <button className="btn-outline flex items-center gap-2" onClick={() => { setTriedToAdvance(false); setStep(step - 1); }} disabled={loading}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-primary flex items-center gap-2" onClick={() => {
                if (!canAdvance()) { setTriedToAdvance(true); return; }
                // After the filters step, require an account. The form autosaves to
                // localStorage, so they land back here with everything intact.
                if (step === 0) {
                  // Don't let anyone slip past while the session check is still in flight.
                  if (!authReady) return;
                  if (!authEmail) {
                    // Sign-in (which also grants Gmail) is the gate after the filters.
                    // The form autosaves, so they resume at Your Info with everything intact.
                    window.location.href = `/signin?next=${encodeURIComponent("/request?resume=1")}`;
                    return;
                  }
                }
                setTriedToAdvance(false);
                setStep(step + 1);
              }}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn-primary flex items-center gap-2 min-w-[160px] justify-center" onClick={() => {
                if (!canAdvance() || loading) { setTriedToAdvance(true); return; }
                handleSubmit();
              }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <>Pay & Get Drafts <ChevronRight size={16} /></>}
              </button>
            )}
            {triedToAdvance && step === 4 && !form.termsAccepted && (
              <p className="text-xs text-red-600 font-medium text-right w-full mt-1">Please agree to the Terms of Service to continue.</p>
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
