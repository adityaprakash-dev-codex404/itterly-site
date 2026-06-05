import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — itterly" },
      {
        name: "description",
        content: "Terms of Service for itterly — community-first intercity ride-sharing.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://itterly.in/terms" },
      { rel: "alternate", href: "https://itterly.in/terms", hrefLang: "x-default" },
      { rel: "alternate", href: "https://itterly.in/terms", hrefLang: "en-in" },
    ],
  }),
  component: Terms,
});

function Terms() {
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
            // LEGAL STATUS
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 sm:px-6 md:px-12 py-12 sm:py-16 max-w-4xl mx-auto">
        <div className="border-fat border-ink bg-paper p-6 sm:p-10 shadow-block">
          <div className="font-mono-c text-xs uppercase tracking-[0.3em] text-red mb-2">
            // EFFECTIVE 2026
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase leading-none mb-8">
            Terms of
            <br />
            <span className="text-red">Service.</span>
          </h1>

          <div className="prose prose-ink max-w-none font-sans text-sm sm:text-base leading-relaxed space-y-6">
            <p className="font-mono-c text-xs uppercase tracking-wide border-b border-ink/20 pb-4">
              PLEASE READ THESE TERMS CAREFULLY. ITTERLY IS A COMMUNITY COST-SHARING PLATFORM, NOT A
              COMMERCIAL RIDE-HAILING OPERATOR.
            </p>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">
                1. Nature of the Platform
              </h2>
              <p>
                itterly provides a peer-to-peer platform that connects private car owners
                ("Drivers") with passengers traveling along the same intercity routes ("Co-riders").
              </p>
              <p className="border-l-thick border-red pl-4 py-1 bg-red/5 font-mono-c text-xs uppercase">
                Compliance Notice: In accordance with Indian motor vehicle guidelines, all trips
                arranged via itterly must be strictly cost-sharing. Drivers are strictly prohibited
                from generating commercial profit. Shared contributions must only cover fuel, tolls,
                and maintenance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">
                2. Eligibility & Identity Verification
              </h2>
              <p>
                To maintain the safety of our network, all users must satisfy the following
                criteria:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 18 years of age.</li>
                <li>
                  You must complete mandatory **Aadhaar eKYC verification** through our authorized
                  partner portal. No anonymous account creation is permitted.
                </li>
                <li>
                  Drivers must upload a valid Driving License, Registration Certificate (RC), and
                  active vehicular insurance.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">
                3. Safety & Live Telemetry Consent
              </h2>
              <p>
                By using itterly on active intercity trips, you provide consent for the collection
                and sharing of real-time GPS coordinates. This location tracking is used solely to
                support our in-app SOS safety features and verified arrival status.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">4. Insurance Coverage</h2>
              <p>
                Every matched seat booked through the itterly platform is covered by a third-party
                group personal accident insurance policy up to ₹5,00,000. This coverage is active
                strictly for the duration of the coordinated intercity transit.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg sm:text-xl uppercase">
                5. User Conduct & Termination
              </h2>
              <p>
                We maintain a strict zero-tolerance policy for harassment, discrimination, unsafe
                driving behavior, and commercial solicitation. Violation of these terms will result
                in immediate and permanent account suspension from the itterly network.
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
