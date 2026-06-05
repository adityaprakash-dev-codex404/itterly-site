import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — itterly" },
      {
        name: "description",
        content: "Privacy Policy for itterly — community-first intercity ride-sharing.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-red selection:text-paper font-sans">
      {/* Header */}
      <header className="border-b-[5px] border-ink bg-paper sticky top-0 z-50">
        <div className="px-5 sm:px-6 md:px-12 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-2xl lowercase hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>itterly</span>
            <span className="text-red">.</span>
          </Link>
          <span className="font-mono-c text-xs uppercase tracking-widest hidden sm:inline">
            // DATA TRANSPARENCY
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 sm:px-6 md:px-12 py-12 sm:py-16 max-w-4xl mx-auto">
        <div className="border-fat border-ink bg-paper p-6 sm:p-10 shadow-block">
          <div className="font-mono-c text-xs uppercase tracking-[0.3em] text-red mb-2">
            // LAST UPDATED: 2026
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase leading-none mb-8">
            Privacy
            <br />
            <span className="text-red">Policy.</span>
          </h1>

          <div className="prose prose-ink max-w-none font-sans text-sm sm:text-base leading-relaxed space-y-6">
            <p>
              At itterly, we are committed to protecting your privacy. This policy explains what
              information we collect, how it is stored and shared, and your rights concerning your
              personal data.
            </p>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">1. Data We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  **Verification Data**: To complete mandatory verification, secure third-party KYC
                  providers process your Aadhaar card. **itterly does not store your Aadhaar number
                  or raw biometric files** on our servers. We only store the verification success
                  status and name.
                </li>
                <li>
                  **Location Details**: We collect your active GPS location coordinates during trips
                  to enable matching and power the group safety SOS system.
                </li>
                <li>
                  **Account Info**: We store your name, email, phone number, and vehicle details
                  (for drivers).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">2. How We Use Data</h2>
              <p>
                We use collected information to match you with compatible routes, manage safety
                during transit, coordinate pickups, process group accident insurance policies, and
                comply with local regulatory mandates.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">3. Information Sharing</h2>
              <p>
                Your coordinate location, vehicle details, and contact numbers are shared only with
                the matched Drivers and Co-riders on your specific trip. We do not sell your
                personal data to advertisers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">
                4. Data Storage & Security
              </h2>
              <p>
                All personal profiles and ride history are encrypted and stored in secure cloud
                database instances. We retain information only as long as necessary to provide
                platform services and maintain historical ride-safety logs.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">
                5. Your Rights & Deletion
              </h2>
              <p>
                You may request access to, correction of, or deletion of your profile and data
                history at any time by sending an email request to{" "}
                <a
                  href="mailto:adityaprakash06official@gmail.com"
                  className="hover:text-red transition-colors underline decoration-thick"
                >
                  adityaprakash06official@gmail.com
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-ink/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link
              to="/"
              className="bg-ink text-paper font-mono-c text-xs uppercase tracking-widest px-5 py-3 border-thick border-ink shadow-block skew-hover"
            >
              ← Back to Home
            </Link>
            <span className="font-mono-c text-xs text-ink/60">India // 2026</span>
          </div>
        </div>
      </main>
    </div>
  );
}
