export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-blue-800 font-semibold text-sm uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: July 9, 2026</p>
        </div>

        <div className="card p-8 sm:p-12 space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. Who We Are</h2>
            <p>IMG Outreach (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates imgoutreach.com, a service that generates personalized physician outreach email drafts for medical students and international medical graduates. Our contact email is <a href="mailto:contact@imgoutreach.com" className="text-blue-800 hover:underline">contact@imgoutreach.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">When you use our service, we collect the following:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li><span className="font-medium text-gray-800">Account information</span> — your name and email address</li>
              <li><span className="font-medium text-gray-800">Order information</span> — your medical school, year of training, specialty preferences, target location, and purpose of outreach</li>
              <li><span className="font-medium text-gray-800">Documents</span> — your CV and any additional documents you upload</li>
              <li><span className="font-medium text-gray-800">Letter of interest</span> — the personal statement you write to inform your email drafts</li>
              <li><span className="font-medium text-gray-800">Payment information</span> — processed securely by Stripe; we never see or store your card details</li>
              <li><span className="font-medium text-gray-800">Gmail OAuth token</span> — a limited-access token used solely to create email drafts in your Gmail Drafts folder</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. Gmail Access — What We Do and Do Not Do</h2>
            <p className="mb-3">To deliver your email drafts directly to your Gmail, you authorize IMG Outreach via Google OAuth. We request only the <strong>gmail.compose</strong> scope, which allows us to create draft emails on your behalf.</p>
            <p className="mb-3">With this access, we:</p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600 mb-3">
              <li>Create personalized email drafts in your Gmail Drafts folder</li>
              <li>Attach your CV to each draft</li>
            </ul>
            <p className="mb-3">We do <strong>not</strong>:</p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li>Read, access, or store any of your existing emails</li>
              <li>Send emails on your behalf</li>
              <li>Delete or modify any of your existing emails or drafts</li>
              <li>Share your Gmail data with any third party</li>
              <li>Use your Gmail data for any purpose other than creating your requested drafts</li>
            </ul>
            <p className="mt-3">Your Gmail refresh token is stored securely and used only to fulfill your order. You can revoke access at any time at <a href="https://myaccount.google.com/permissions" className="text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.</p>
            <p className="mt-3">Our use of Google user data complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. How We Use Your Information</h2>
            <p className="mb-3">We use the information you provide to:</p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li>Generate personalized email drafts tailored to your background and target physicians</li>
              <li>Deliver those drafts to your Gmail Drafts folder</li>
              <li>Send you order confirmation and delivery notifications</li>
              <li>Respond to your support requests</li>
            </ul>
            <p className="mt-3">We do not use your personal information for advertising or sell it to any third party.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. How We Store Your Data</h2>
            <p>Your order data and documents are stored securely in Supabase (a managed database provider). CV files are stored in encrypted cloud storage. We retain your data for as long as necessary to fulfill your order and handle any support requests, and delete it upon request.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services to operate:</p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li><span className="font-medium text-gray-800">Stripe</span> — payment processing</li>
              <li><span className="font-medium text-gray-800">Supabase</span> — secure data storage</li>
              <li><span className="font-medium text-gray-800">Resend</span> — transactional emails (order confirmations)</li>
              <li><span className="font-medium text-gray-800">Google OAuth</span> — Gmail draft delivery</li>
              <li><span className="font-medium text-gray-800">Vercel</span> — website hosting</li>
            </ul>
            <p className="mt-3">Each of these services has its own privacy policy. We share only the minimum data necessary to provide the service.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li>Request access to the personal data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Revoke Gmail access at any time via your Google account settings</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:contact@imgoutreach.com" className="text-blue-800 hover:underline">contact@imgoutreach.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">8. Cookies</h2>
            <p>We use only essential cookies necessary for the site to function (session management). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>Our service is intended for medical students and graduates aged 18 and older. We do not knowingly collect data from anyone under 18.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes by email. Continued use of the service after changes are posted constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>Questions about this privacy policy? Email us at{" "}
              <a href="mailto:contact@imgoutreach.com" className="text-blue-800 hover:underline font-medium">contact@imgoutreach.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
