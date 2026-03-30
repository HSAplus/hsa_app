import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | HSA Plus",
  description:
    "Learn how HSA Plus collects, uses, and protects your personal, financial, and medical expense data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ─── Nav ─── */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={56}
              height={37}
              className="rounded-lg"
            />
            <span className="text-base font-semibold tracking-tight font-sans">
              HSA Plus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-[13px] text-[#64748B]">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0C1220] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#94A3B8] mb-12">
          Effective date: March 29, 2025 &middot; Last updated: March 29, 2025
        </p>

        <div className="prose-policy space-y-10 text-[15px] leading-relaxed text-[#475569]">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              1. Introduction
            </h2>
            <p>
              HSA Plus (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides a web application
              that helps users track medical expenses, manage Health Savings Account (HSA),
              Limited Purpose FSA (LPFSA), and Health Care FSA (HCFSA) records, and plan
              reimbursement strategies. This Privacy Policy explains how we collect, use,
              disclose, and protect your information when you use our application and services.
            </p>
            <p className="mt-3">
              By using HSA Plus, you consent to the practices described in this policy. If you
              do not agree, please discontinue use of the application.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              2. Information We Collect
            </h2>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              2.1 Account &amp; Profile Information
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Name (first, middle, last)</li>
              <li>Email address and password (or Google OAuth credentials)</li>
              <li>Date of birth</li>
              <li>Coverage type (individual or family)</li>
            </ul>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              2.2 Financial Information
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>HSA balance, annual contribution amount, and contribution increase rate</li>
              <li>Expected annual return percentage and investment time horizon</li>
              <li>Federal tax bracket and state tax rate</li>
              <li>
                Banking connection data obtained through Plaid (account identifiers, balance
                information) when you choose to sync your HSA
              </li>
            </ul>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              2.3 Medical Expense Data
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Expense description, amount, date(s) of service, and provider name</li>
              <li>Patient name and relationship (self, spouse, dependent child, domestic partner)</li>
              <li>Expense category (medical, dental, vision, prescription, mental health, etc.)</li>
              <li>Account type (HSA, LPFSA, HCFSA) and payment method</li>
              <li>Reimbursement status, date, and amount</li>
              <li>Notes and audit-readiness information</li>
            </ul>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              2.4 Uploaded Documents
            </h3>
            <p>
              You may upload receipts, Explanation of Benefits (EOBs), invoices, and credit card
              statements. These documents are stored securely and associated with the
              corresponding expense record.
            </p>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              2.5 Dependent Information
            </h3>
            <p>
              If you track expenses for family members, we collect their name, date of birth,
              and relationship to you.
            </p>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              2.6 Usage &amp; Technical Data
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Browser type, operating system, and device information</li>
              <li>IP address and approximate geographic location</li>
              <li>Pages visited, features used, and interaction timestamps</li>
              <li>
                Cookies and similar technologies necessary for authentication, session
                management, and security
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Provide, operate, and maintain the HSA Plus application</li>
              <li>
                Track and organize your medical expenses, reimbursement history, and
                compliance documentation
              </li>
              <li>
                Generate investment growth projections, what-if scenarios, and tax savings
                calculations
              </li>
              <li>Sync your HSA balance through Plaid when you opt in</li>
              <li>
                Send transactional emails (e.g., password resets) and periodic email digests
                (weekly or monthly) when you enable them
              </li>
              <li>Calculate and display audit-readiness scores based on your uploaded documents</li>
              <li>Improve the application, fix bugs, and develop new features</li>
              <li>Protect against fraud, abuse, and unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              4. Third-Party Services
            </h2>
            <p>
              We share data with the following third-party services strictly as necessary to
              operate HSA Plus. We do not sell your personal information.
            </p>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="font-semibold text-[#0C1220] text-sm mb-1">
                  Supabase (Authentication, Database &amp; File Storage)
                </p>
                <p className="text-sm text-[#64748B]">
                  Stores your account credentials, profile data, expense records, and uploaded
                  documents. Data is encrypted in transit (TLS) and at rest. Supabase&apos;s
                  infrastructure is hosted in SOC 2 Type II compliant data centers.
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="font-semibold text-[#0C1220] text-sm mb-1">
                  Plaid (Banking Connection)
                </p>
                <p className="text-sm text-[#64748B]">
                  When you opt to sync your HSA balance, Plaid securely connects to your
                  financial institution. We receive only account identifiers and balance
                  information &mdash; never your bank login credentials. You can disconnect
                  your bank at any time. Plaid&apos;s data practices are governed by their{" "}
                  <a
                    href="https://plaid.com/legal/#end-user-privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#059669] underline hover:text-[#047857]"
                  >
                    End User Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="font-semibold text-[#0C1220] text-sm mb-1">
                  Resend (Email Delivery)
                </p>
                <p className="text-sm text-[#64748B]">
                  Processes transactional and digest emails on our behalf. Resend receives
                  your email address and email content only as needed for delivery.
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="font-semibold text-[#0C1220] text-sm mb-1">
                  OpenAI (Eligibility Verification)
                </p>
                <p className="text-sm text-[#64748B]">
                  Expense descriptions may be sent to OpenAI&apos;s API to help verify HSA
                  eligibility. No personally identifiable information (names, dates of birth,
                  or financial details) is included in these requests. OpenAI does not use
                  API data for model training.
                </p>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <p className="font-semibold text-[#0C1220] text-sm mb-1">
                  Anthropic Claude (Receipt Scanning)
                </p>
                <p className="text-sm text-[#64748B]">
                  Receipt images uploaded by Plus subscribers may be sent to Anthropic&apos;s
                  Claude API for automated data extraction (provider name, amount, date, and
                  expense category). Only the receipt image is transmitted &mdash; no
                  personally identifiable information from your profile is included. Anthropic
                  does not use API data for model training per their commercial terms.
                </p>
              </div>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              5. Data Retention &amp; Disposal
            </h2>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              5.1 Retention While Active
            </h3>
            <p>
              We retain your data for as long as your account is active. HSA Plus is designed
              to help you maintain records for the IRS-recommended retention period of at
              least seven years. The application provides retention alerts to help you track
              when expenses have met the recommended documentation period.
            </p>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              5.2 Account Deletion &amp; Data Disposal
            </h3>
            <p>
              When you delete your account, the following actions are performed automatically
              and irreversibly:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-[#0C1220]">Account &amp; profile data</strong> is
                permanently deleted. All related records (expenses, dependents, templates,
                preferences) are cascade-deleted from the database.
              </li>
              <li>
                <strong className="text-[#0C1220]">Uploaded documents</strong> (receipts,
                EOBs, invoices, statements) are permanently removed from cloud storage.
              </li>
              <li>
                <strong className="text-[#0C1220]">Plaid connection</strong> &mdash; if you
                have a linked HSA, the Plaid access token is revoked via Plaid&apos;s API,
                severing all access to your financial institution. Stored tokens are deleted
                from our database.
              </li>
              <li>
                <strong className="text-[#0C1220]">Email digest preferences</strong> are
                deleted and all scheduled emails are cancelled.
              </li>
            </ul>
            <p className="mt-3">
              Deletion is completed within 30 days. We do not retain any personal data after
              account deletion except where required by law.
            </p>

            <h3 className="text-[15px] font-semibold text-[#0C1220] mt-5 mb-2">
              5.3 Partial Data Removal
            </h3>
            <p>
              You can remove specific data without deleting your account at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-[#0C1220]">Disconnect your HSA</strong> &mdash;
                revokes the Plaid access token and removes all stored banking connection data
                from your account
              </li>
              <li>
                <strong className="text-[#0C1220]">Delete individual expenses</strong> &mdash;
                removes the expense record and all associated uploaded documents
              </li>
              <li>
                <strong className="text-[#0C1220]">Disable email digests</strong> &mdash;
                stops all periodic summary emails immediately via your profile settings
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              6. Data Security
            </h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>All data is transmitted over HTTPS/TLS encryption</li>
              <li>Database and file storage are encrypted at rest</li>
              <li>
                Authentication tokens are securely managed; passwords are hashed and never
                stored in plaintext
              </li>
              <li>
                Banking credentials are never accessed or stored by HSA Plus &mdash; Plaid
                handles all financial institution authentication
              </li>
              <li>Row-level security policies restrict database access to authorized users</li>
            </ul>
            <p className="mt-3">
              While we strive to protect your information, no method of electronic transmission
              or storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              7. Cookies &amp; Similar Technologies
            </h2>
            <p>
              HSA Plus uses strictly necessary cookies for authentication and session management.
              We do not use advertising cookies, tracking pixels, or third-party analytics
              cookies. No cookie consent banner is required because we only use essential cookies
              that are exempt under applicable privacy regulations.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              8. Your Rights &amp; Choices
            </h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-[#0C1220]">Access</strong> the personal data we hold
                about you
              </li>
              <li>
                <strong className="text-[#0C1220]">Correct</strong> inaccurate or incomplete
                data via your profile settings
              </li>
              <li>
                <strong className="text-[#0C1220]">Delete</strong> your account and all
                associated data
              </li>
              <li>
                <strong className="text-[#0C1220]">Export</strong> your expense data (CSV
                export is available in the dashboard)
              </li>
              <li>
                <strong className="text-[#0C1220]">Withdraw consent</strong> for optional
                features such as Plaid bank sync or email digests at any time
              </li>
              <li>
                <strong className="text-[#0C1220]">Opt out</strong> of email digests at any
                time through your profile settings
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, use the in-app settings or contact us at the
              address listed below.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              9. California Privacy Rights (CCPA)
            </h2>
            <p>
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA), including the right to know what personal information
              we collect and how it is used, the right to request deletion, and the right to
              opt out of the sale of personal information. <strong className="text-[#0C1220]">We
              do not sell your personal information.</strong>
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              10. Children&apos;s Privacy
            </h2>
            <p>
              HSA Plus is not directed to children under 13. We do not knowingly collect
              personal information from children under 13. If you believe a child under 13
              has provided us with personal information, please contact us so we can delete it.
              Dependent information entered by a parent or guardian for expense tracking
              purposes is managed solely by the account holder.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              11. International Users
            </h2>
            <p>
              HSA Plus is designed for use within the United States, as HSA, LPFSA, and HCFSA
              accounts are U.S. tax-advantaged instruments. If you access HSA Plus from outside
              the United States, your data will be transferred to and processed in the United
              States. By using the application, you consent to this transfer.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes,
              we will notify you by email or by posting a prominent notice in the application.
              Your continued use of HSA Plus after changes are posted constitutes your acceptance
              of the updated policy.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0C1220] mb-3">
              13. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your data
              rights, please contact us at:
            </p>
            <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-white p-5">
              <p className="font-semibold text-[#0C1220] text-sm">HSA Plus</p>
              <p className="text-sm text-[#64748B] mt-1">
                Email:{" "}
                <a
                  href="mailto:privacy@hsaplus.app"
                  className="text-[#059669] underline hover:text-[#047857]"
                >
                  privacy@hsaplus.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
            <Image
              src="/logo.png"
              alt="HSA Plus"
              width={28}
              height={18}
              className="rounded"
            />
            <span>&copy; {new Date().getFullYear()} HSA Plus</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-[#94A3B8]">
            <Link href="/calculator" className="hover:text-[#64748B] transition-colors">
              Calculator
            </Link>
            <Link href="/login" className="hover:text-[#64748B] transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[#64748B] transition-colors">
              Get started
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-[#94A3B8] pb-4">Tax-free wealth, made simple.</p>
      </footer>
    </div>
  );
}
