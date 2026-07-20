export default function TermsPage() {
  return (
    <div className="pt-28 pb-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-blue-800 font-semibold text-sm uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: July 2, 2026</p>
        </div>

        <div className="card p-8 sm:p-12 space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. What IMG Outreach Does</h2>
            <p>IMG Outreach (&quot;we,&quot; &quot;us,&quot; &quot;the service&quot;) generates personalized physician outreach email drafts using artificial intelligence. We research physicians&apos; published work and combine it with information you provide to produce draft emails. These drafts are made available on your review page, and — when you approve them — are sent from your own Gmail account, spaced out over time.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. No Guarantee of Replies</h2>
            <p>We do not guarantee and cannot promise that any physician will reply to your emails. Whether a physician responds depends entirely on their schedule, interest, and availability. Our service guarantees delivery of personalized drafts — not outcomes.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. Accuracy of Your Information</h2>
            <p>You are responsible for the accuracy of all information you provide, including your CV, letter of interest, credentials, and exam scores. We generate emails based on what you tell us. If you provide false or misleading information, the resulting emails may contain inaccurate claims. You agree to provide truthful information about yourself.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. Email Content</h2>
            <p>Every email drafted by our service references only information you provided or information derivable from publicly available physician profiles (publications, institutional pages). We do not fabricate clinical experiences or credentials. If an email references a physician&apos;s paper, we encourage you to read that paper before sending.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. Payment and Refunds</h2>
            <p>All payments are one-time and processed securely via Stripe. Once your drafts have been generated and delivered, refunds are not available. If there is a technical failure that prevents delivery of your drafts, contact us within 7 days and we will either re-deliver or issue a full refund at our discretion.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. Your Data</h2>
            <p>We store the information you submit (name, email, CV, letter of interest) solely to generate your drafts and communicate with you about your order. We do not sell your data to third parties. Your CV and personal information are never shared with physicians or any external party.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. Gmail Access</h2>
            <p>Delivering drafts to your Gmail requires you to authenticate with Google OAuth. We request only the minimum Gmail permissions needed to create drafts on your behalf. We do not read, send, or delete your existing emails.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">8. Acceptable Use</h2>
            <p>You agree to use the drafts for legitimate professional outreach only. You may not use our service to send spam, harass physicians, or make fraudulent misrepresentations. We reserve the right to refuse service to anyone violating these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, IMG Outreach is not liable for any indirect, incidental, or consequential damages arising from your use of the service, including loss of opportunity or failure to obtain a position. Our total liability to you is limited to the amount you paid for your order.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">10. Changes to These Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>Questions about these terms? Email us at{" "}
              <a href="mailto:contact@imgoutreach.com" className="text-blue-800 hover:underline font-medium">contact@imgoutreach.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
