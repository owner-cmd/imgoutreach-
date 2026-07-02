"use client";
import { useState } from "react";
import { Mail, Clock, MessageSquare, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      alert("Failed to send. Please email us directly at contact@imgoutreach.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-blue-800 font-semibold text-sm uppercase tracking-widest mb-3">Contact</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">Get in touch</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Have a question about your order, need a refund, or want to give feedback? We respond to every message.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          {/* Left — info */}
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="text-blue-800" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email us</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Send your question to{" "}
                    <a href="mailto:contact@imgoutreach.com" className="text-blue-800 hover:underline font-medium">
                      contact@imgoutreach.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="text-blue-800" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Response time</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We typically reply within a few hours during business days. Urgent order issues are prioritized.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="text-blue-800" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Common topics</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1.5">
                    {[
                      "Order status / delivery timeline",
                      "Request a revision or refund",
                      "Technical issue with your form",
                      "Custom bulk order inquiry",
                      "Partnership or collaboration",
                    ].map(t => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-800 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <div className="card p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-blue-800" size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent</h2>
                  <p className="text-gray-600 text-sm">
                    We&apos;ll get back to you at <span className="font-medium text-gray-900">{form.email}</span> within a few hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your name</label>
                      <input className="input" placeholder="Your name" value={form.name} onChange={e => set("name", e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Email address</label>
                      <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <select className="input" value={form.subject} onChange={e => set("subject", e.target.value)} required>
                      <option value="">Select a topic…</option>
                      <option>Order status or delivery question</option>
                      <option>Revision or refund request</option>
                      <option>Technical issue</option>
                      <option>Bulk / custom order inquiry</option>
                      <option>Partnership or press</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea
                      className="input min-h-[160px] resize-none"
                      placeholder="Describe your question or issue in detail. If it's about an order, include your email address and any order details you have."
                      value={form.message}
                      onChange={e => set("message", e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center flex items-center gap-2" disabled={loading}>
                    {loading ? "Sending…" : "Send message"}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Or email us directly at{" "}
                    <a href="mailto:contact@imgoutreach.com" className="text-blue-800 hover:underline">contact@imgoutreach.com</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
