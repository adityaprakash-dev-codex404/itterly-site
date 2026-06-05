import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { z } from "zod";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Car,
  Umbrella,
  Users,
  Siren,
  BadgeCheck,
  MessageCircle,
  Wallet,
  IdCard,
  Check,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import hero1 from "@/assets/hero-1.png";
import hero2 from "@/assets/hero-2.png";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "itterly — Speed. Trust. Intercity." },
      {
        name: "description",
        content:
          "itterly is India's community-first intercity ride-sharing network. Aadhaar verified, insured, women-safe — engineered for the way Bharat actually moves.",
      },
      { property: "og:title", content: "itterly — Speed. Trust. Intercity." },
      {
        property: "og:description",
        content: "Verified intercity carpooling for Bharat. Reserve your seat.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://itterly.in/" },
      { rel: "alternate", href: "https://itterly.in/", hrefLang: "x-default" },
      { rel: "alternate", href: "https://itterly.in/", hrefLang: "en-in" },
    ],
  }),
  component: Landing,
});

/* ---------------------------------- DATA ---------------------------------- */

// Single source of truth for ALL prices — no hardcoded fares anywhere else.
const FARE_CONFIG = {
  base: 40, // ₹ flag-down
  perKm: 6.5, // itterly cost per km per car
  tollPerKm: 0.8, // averaged toll provision per km
  cabPerKm: 22, // private cab benchmark
  busPerKm: 2.2,
  trainPerKm: 1.6,
};

function calcItterly(km: number, seats: number) {
  const perCar = FARE_CONFIG.base + FARE_CONFIG.perKm * km + FARE_CONFIG.tollPerKm * km;
  return Math.round(perCar / Math.max(1, seats));
}
function calcCab(km: number) {
  return Math.round(FARE_CONFIG.cabPerKm * km);
}

const STATS = [
  ["20M", "CARPOOL USERS IN INDIA / 2025"],
  ["40M", "DAILY INTERCITY TRIPS"],
  ["₹2.1T", "MARKET BY 2032"],
  ["54.2%", "GLOBAL CAGR"],
  ["300M+", "CARS ON INDIAN ROADS"],
  ["35%", "OF SEATS GO EMPTY"],
];

const TRUST_LAYERS = [
  {
    n: "01",
    icon: ShieldCheck,
    t: "AADHAAR KYC",
    d: "Every rider and driver is verified against Aadhaar. No anonymous accounts. No second chances.",
  },
  {
    n: "02",
    icon: Car,
    t: "VEHICLE VERIFIED",
    d: "Vahan-checked registration, RC, PUC and insurance — before a trip can be listed.",
  },
  {
    n: "03",
    icon: Umbrella,
    t: "₹5L PER-TRIP COVER",
    d: "Mandatory passenger insurance issued automatically when the trip starts.",
  },
  {
    n: "04",
    icon: Users,
    t: "WOMEN-ONLY MODE",
    d: "Server-side enforced. Verified women drivers, verified women passengers. No grey area.",
  },
  {
    n: "05",
    icon: Siren,
    t: "24/7 SOS",
    d: "One-tap dispatch to control room with live location, vehicle and co-passenger context.",
  },
  {
    n: "06",
    icon: BadgeCheck,
    t: "VERIFIED COMMUNITY",
    d: "Mutual ratings, community admin moderation, and immutable trip history.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "VERIFY",
    d: "Aadhaar eKYC. Phone. Selfie. Real humans only — no anonymous riders, no anonymous drivers.",
  },
  {
    n: "02",
    t: "MATCH",
    d: "Same route. Same time. Community-rated. Filter by gender, language, or workplace.",
  },
  {
    n: "03",
    t: "RIDE",
    d: "UPI split at the tap of a button. In-app SOS. Verified arrival. Done.",
  },
];

// Illustrative relative cost index per 100km (100 = baseline private cab)
const COMPARE = [
  { name: "itterly", costIndex: 32, color: "red" as const },
  { name: "BlaBlaCar", costIndex: 38, color: "ink" as const },
  { name: "InDrive", costIndex: 76, color: "ink" as const },
  { name: "Ola", costIndex: 96, color: "ink" as const },
  { name: "Uber", costIndex: 100, color: "ink" as const },
];

const COMPARE_MATRIX = [
  { feature: "Intercity focus", values: [true, true, false, false, false] },
  { feature: "Aadhaar KYC mandatory", values: [true, false, false, false, false] },
  { feature: "Per-trip insurance", values: [true, false, false, "Partial", "Partial"] },
  { feature: "Women-only mode", values: [true, false, false, false, false] },
  { feature: "UPI auto-split", values: [true, false, false, false, false] },
  { feature: "Community admin console", values: [true, false, false, false, false] },
];
const COMPARE_COLS = ["itterly", "BlaBlaCar", "InDrive", "Ola", "Uber"];

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  city: z.string().max(64).optional(),
  role: z.enum(["rider", "driver", "admin"]).optional(),
});

/* --------------------------------- HOOKS ---------------------------------- */

function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);
  async function refresh() {
    try {
      const { data, error } = await supabase.rpc("get_waitlist_count");
      if (error) throw error;
      if (typeof data === "number") setCount(data);
    } catch {
      /* noop */
    }
  }
  useEffect(() => {
    refresh();

    const channel = supabase
      .channel("public:waitlist_signups")
      .on("postgres_changes", { event: "*", schema: "public", table: "waitlist_signups" }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return { count, refresh };
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    if (start === end) return;
    const duration = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{display.toLocaleString("en-IN")}</span>;
}

/* --------------------------------- PAGE ----------------------------------- */

function Landing() {
  const waitlist = useWaitlistCount();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "itterly",
    "url": "https://itterly.in",
    "description":
      "itterly is India's community-first intercity ride-sharing network. Aadhaar verified, insured, women-safe — engineered for the way Bharat actually moves.",
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "itterly",
    "url": "https://itterly.in",
    "logo": "https://itterly.in/favicon.png",
    "email": "adityaprakash06official@gmail.com",
    "sameAs": ["https://github.com/adityaprakash-dev-codex404/itterly-site"],
  };

  return (
    <main className="min-h-screen bg-paper text-ink overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Toaster />
      <Nav />
      <CounterStrip count={waitlist.count} />
      <Hero count={waitlist.count} onSignup={waitlist.refresh} />
      <Ticker />
      <TrustStack />
      <FareCalculator />
      <Compare />
      <Thesis />
      <How />
      <AdminConsole />
      <WhyNow />
      <Waitlist count={waitlist.count} onSignup={waitlist.refresh} />
      <Footer />
    </main>
  );
}

/* ---------------------------------- NAV ----------------------------------- */

function Nav() {
  return (
    <header className="border-b-[3px] border-ink bg-paper sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-4 gap-3">
        <a
          href="#top"
          className="flex items-center gap-3 font-display text-xl sm:text-2xl tracking-tight shrink-0 lowercase hover:opacity-90 transition-opacity"
        >
          <img
            src={logoImg}
            alt="itterly logo"
            className="h-8 w-8 object-contain rounded-md border-[3px] border-ink shadow-[3px_3px_0_0_rgba(0,0,0,1)] bg-paper"
          />
          <span className="font-display">
            itterly<span className="text-red">.</span>
          </span>
        </a>
        <nav className="hidden md:flex gap-8 font-mono-c text-xs uppercase tracking-widest">
          <a href="#trust" className="skew-hover">
            Trust Stack
          </a>
          <a href="#fare" className="skew-hover">
            Fare
          </a>
          <a href="#compare" className="skew-hover">
            vs Others
          </a>
          <a href="#admin" className="skew-hover">
            Admins
          </a>
        </nav>
        <a
          href="#waitlist"
          className="font-mono-c text-[10px] sm:text-xs uppercase tracking-widest border-thick border-ink px-3 sm:px-4 py-2 bg-ink text-paper skew-hover whitespace-nowrap"
        >
          <span className="hidden sm:inline">Join Waitlist →</span>
          <span className="sm:hidden">Join →</span>
        </a>
      </div>
    </header>
  );
}

function CounterStrip({ count }: { count: number | null }) {
  return (
    <div className="bg-red text-paper border-b-[3px] border-ink overflow-hidden">
      <div className="px-4 sm:px-6 md:px-10 py-2 flex items-center justify-between gap-3 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">
        <span className="truncate">// LIVE WAITLIST</span>
        <span className="flex items-baseline gap-2 shrink-0">
          <AnimatedNumber value={count ?? 0} className="font-display text-base sm:text-xl" />
          <span className="hidden sm:inline">BHARATIS ALREADY ONBOARD</span>
          <span className="sm:hidden">ONBOARD</span>
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------- HERO ---------------------------------- */

function Hero({ count, onSignup }: { count: number | null; onSignup: () => void }) {
  return (
    <section id="top" className="relative grain border-b-[5px] border-ink">
      <div className="grid grid-cols-12 gap-0 md:min-h-[88vh]">
        <div className="col-span-12 md:col-span-7 px-5 sm:px-6 md:px-12 pt-8 md:pt-16 pb-12 md:pb-16 relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-ink text-paper px-3 py-1 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]"
          >
            MFG // 2026 — INDIA &nbsp;·&nbsp; SERIES 01 / INTERCITY
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-[12vw] sm:text-[10vw] md:text-[7.5vw] lg:text-[7vw] leading-[0.85] mt-6 uppercase tracking-tighter"
          >
            <span className="block">SPEED.</span>
            <span className="block">
              TRUST<span className="text-red">.</span>
            </span>
            <span className="block">INTERCITY</span>
          </motion.h1>

          <p className="mt-6 max-w-xl font-sans text-sm sm:text-base md:text-lg leading-snug">
            <span className="font-display lowercase">itterly</span> is the community-first
            ride-sharing network rebuilding intercity travel in India — Aadhaar verified, insured,
            women-safe, and engineered for the way the country actually moves.
          </p>

          <InlineWaitlistForm onSignup={onSignup} />

          <p className="mt-3 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.25em] text-ink/70">
            // NO SPAM. EARLY ACCESS FOR MUMBAI · PUNE · BANGALORE · DELHI.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-xl">
            {[
              ["₹5L", "INSURANCE / TRIP"],
              ["100%", "AADHAAR KYC"],
              ["24/7", "SOS NETWORK"],
            ].map(([k, v]) => (
              <div key={v} className="border-thick border-ink p-3 sm:p-4 bg-paper">
                <div className="font-display text-xl sm:text-2xl md:text-3xl">{k}</div>
                <div className="font-mono-c text-[9px] sm:text-[10px] uppercase tracking-[0.25em] mt-1">
                  {v}
                </div>
              </div>
            ))}
          </div>

          {count !== null && (
            <div className="mt-6 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 bg-red rounded-full animate-pulse" />
              <AnimatedNumber value={count} className="font-display text-lg text-red" />
              <span>BHARATIS ALREADY ONBOARD</span>
            </div>
          )}
        </div>

        {/* COLLAGE */}
        <div className="col-span-12 md:col-span-5 relative border-t-[5px] md:border-t-0 md:border-l-[5px] border-ink bg-bone overflow-hidden min-h-[70vw] md:min-h-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.7, 0, 0.3, 1] }}
            className="absolute top-[8%] right-[8%] w-[55%] aspect-square rounded-full bg-red"
          />
          <div
            className="absolute top-[18%] left-[6%] w-0 h-0"
            style={{
              borderLeft: "0 solid transparent",
              borderRight: "25vw solid transparent",
              borderBottom: "22vw solid var(--ink)",
              maxWidth: 240,
            }}
          />
          <motion.img
            src={hero1}
            alt="itterly ride match preview"
            initial={{ opacity: 0, y: 30, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="absolute top-[14%] right-[6%] w-[55%] max-w-[320px] border-fat border-ink shadow-block z-10"
          />
          <motion.img
            src={hero2}
            alt="itterly driver network preview"
            initial={{ opacity: 0, y: 30, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="absolute bottom-[12%] left-[12%] w-[48%] max-w-[280px] border-fat border-ink shadow-block-red z-10"
          />
          <div className="absolute bottom-[8%] right-[10%] w-8 h-8 bg-ink z-20" />
          <div className="absolute top-[6%] left-[40%] w-16 h-16 diag-stripes opacity-60" />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 rotate-90 origin-right font-mono-c text-[10px] uppercase tracking-[0.4em] z-30 whitespace-nowrap">
            // CONSTRUCTED IN BHARAT
          </div>
        </div>
      </div>
    </section>
  );
}

function InlineWaitlistForm({ onSignup }: { onSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"rider" | "driver" | "admin">("rider");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse({ email, role });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist_signups").insert({
        email: parsed.data.email,
        role: parsed.data.role ?? "rider",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already registered on the waitlist.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("You're in. Welcome to itterly.");
        setEmail("");
        onSignup();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 max-w-xl">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row border-fat border-ink bg-paper"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOU@EMAIL.IN"
          maxLength={255}
          className="flex-1 px-4 py-4 font-mono-c text-sm uppercase tracking-widest bg-paper focus:outline-none placeholder:text-ink/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-red text-paper font-mono-c text-xs sm:text-sm uppercase tracking-widest px-5 sm:px-6 py-4 inline-flex items-center justify-center gap-2 disabled:opacity-60 border-t-thick sm:border-t-0 sm:border-l-thick border-ink"
        >
          {loading ? "..." : "Join Waitlist"} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-4 items-center font-mono-c text-xs uppercase tracking-widest">
        <span className="text-ink/60">I am a:</span>
        {(["rider", "driver", "admin"] as const).map((r) => (
          <label key={r} className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="inline-role"
              value={r}
              checked={role === r}
              onChange={() => setRole(r)}
              className="w-4 h-4 accent-[var(--red)] cursor-pointer"
            />
            <span className={role === r ? "text-red font-bold" : "text-ink/80 hover:text-ink"}>
              {r}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- TICKER ---------------------------------- */

function Ticker() {
  const items = [...STATS, ...STATS];
  return (
    <section className="bg-ink text-paper border-b-[5px] border-ink overflow-hidden">
      <div className="ticker flex whitespace-nowrap py-5">
        {items.map((s, i) => (
          <div key={i} className="flex items-baseline gap-3 px-8 shrink-0">
            <span className="font-display text-3xl text-red">{s[0]}</span>
            <span className="font-mono-c text-xs uppercase tracking-[0.3em]">{s[1]}</span>
            <span className="font-display text-red px-4">●</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
      <div className="font-display text-3xl sm:text-5xl border-thick border-ink px-3 py-1">{n}</div>
      <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">{label}</div>
      <div className="flex-1 h-[3px] bg-ink" />
    </div>
  );
}

/* ----------------------------- TRUST STACK -------------------------------- */

function TrustStack() {
  return (
    <section id="trust" className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 border-b-[5px] border-ink">
      <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] text-red mb-4">
        // CHAPTER 02 — THE TRUST STACK
      </div>
      <div className="grid grid-cols-12 gap-6 mb-12">
        <h2 className="col-span-12 md:col-span-8 font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.9]">
          SIX LAYERS.
          <br />
          <span className="text-red">ZERO</span> BLIND SPOTS.
        </h2>
        <p className="col-span-12 md:col-span-4 font-sans text-sm sm:text-base self-end leading-snug">
          Carpooling fails in India because trust is bolted on at the end.
          <span className="font-display lowercase"> itterly </span>
          builds it from the metal up — verification, insurance, safety and community are
          non-negotiable defaults.
        </p>
      </div>
      <div className="grid grid-cols-12 gap-5 sm:gap-6">
        {TRUST_LAYERS.map((l, i) => {
          const Icon = l.icon;
          const offset = i % 3 === 1 ? "md:translate-y-6" : i % 3 === 2 ? "md:translate-y-12" : "";
          return (
            <div key={l.n} className={`col-span-12 sm:col-span-6 lg:col-span-4 ${offset}`}>
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                className="group w-full h-full border-fat border-ink bg-paper p-5 sm:p-6 relative overflow-hidden transition-all duration-300 ease-out hover:-translate-x-2 hover:-translate-y-2 hover:shadow-block cursor-default select-none"
              >
                <div className="absolute top-2 right-3 font-display text-7xl sm:text-8xl text-ink/5 select-none transition-all duration-300 group-hover:text-ink/10 group-hover:scale-105">
                  {l.n}
                </div>
                <div className="flex items-start justify-between relative">
                  <div className="w-9 h-9 bg-ink text-paper flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-mono-c text-[10px] uppercase tracking-[0.3em] text-ink/60">
                    LAYER / {l.n}
                  </div>
                </div>
                <div className="font-display text-xl sm:text-2xl uppercase mt-6 relative">{l.t}</div>
                <p className="text-sm leading-snug mt-3 relative">{l.d}</p>
                {(i === 0 || i === 4) && (
                  <div className="absolute bottom-4 right-4 flex items-center justify-center">
                    <span className="absolute inline-flex h-5 w-5 rounded-full bg-red opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red transition-transform duration-300 group-hover:scale-125" />
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------- FARE CALCULATOR ------------------------------ */

function FareCalculator() {
  const [km, setKm] = useState(150);
  const [seats, setSeats] = useState(3);
  const itterly = useMemo(() => calcItterly(km, seats), [km, seats]);
  const cab = useMemo(() => calcCab(km), [km]);
  const savings = Math.max(0, Math.round(((cab - itterly) / cab) * 100));

  return (
    <section
      id="fare"
      className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 border-b-[5px] border-ink bg-bone grain"
    >
      <SectionLabel n="03" label="The Fare Calculator" />
      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        <div className="col-span-12 lg:col-span-5">
          <h2 className="font-display text-3xl sm:text-5xl uppercase leading-[0.9]">
            FARES THAT
            <br />
            <span className="text-red">ADD UP.</span>
          </h2>
          <p className="mt-5 text-sm sm:text-base max-w-md leading-snug">
            No surge. No mystery multiplier. Move the sliders — the formula on the right
            recalculates in real time. Prices scale with kilometres and the number of seats you
            share, not with how desperate you look.
          </p>
          <div className="mt-6 border-thick border-ink p-4 bg-paper font-mono-c text-[11px] sm:text-xs leading-relaxed">
            fare/person ={" "}
            <span className="text-red">
              (₹{FARE_CONFIG.base} + ₹{FARE_CONFIG.perKm}/km × km + ₹{FARE_CONFIG.tollPerKm}/km
              tolls)
            </span>{" "}
            / seats
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 border-fat border-ink bg-paper p-5 sm:p-8 shadow-block">
          <label className="block">
            <div className="flex items-center justify-between font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">
              <span>Distance</span>
              <span className="font-display text-lg text-red">{km} KM</span>
            </div>
            <input
              type="range"
              min={10}
              max={800}
              step={5}
              value={km}
              onChange={(e) => setKm(Number(e.target.value))}
              className="w-full mt-3 accent-[var(--red)]"
            />
          </label>

          <div className="mt-6">
            <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2">
              Seats shared
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeats(s)}
                  className={`border-thick border-ink px-3 py-3 font-display text-xl ${seats === s ? "bg-ink text-paper" : "bg-paper"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
            <div className="border-fat border-ink bg-red text-paper p-4 sm:p-5">
              <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">
                itterly / person
              </div>
              <div className="font-display text-3xl sm:text-5xl mt-2">
                ₹<AnimatedNumber value={itterly} />
              </div>
            </div>
            <div className="border-fat border-ink bg-paper p-4 sm:p-5">
              <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">
                Private cab
              </div>
              <div className="font-display text-3xl sm:text-5xl mt-2 line-through decoration-red decoration-4">
                ₹<AnimatedNumber value={cab} />
              </div>
            </div>
          </div>

          <div className="mt-4 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] text-ink/70">
            You save <span className="font-display text-base text-red">{savings}%</span> vs. a solo
            cab on this route.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- COMPARE ---------------------------------- */

function Compare() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const max = Math.max(...COMPARE.map((c) => c.costIndex));

  return (
    <section
      id="compare"
      className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 border-b-[5px] border-ink"
    >
      <SectionLabel n="04" label="vs. The Rest" />
      <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase leading-[0.9] max-w-4xl">
        Same road. <span className="text-red">Different math.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-sm sm:text-base leading-snug">
        Illustrative relative cost index per 100 km of intercity travel (private cab benchmarked at
        100). Lower is better.
      </p>

      {/* Bar chart */}
      <div ref={ref} className="mt-10 border-fat border-ink bg-paper p-5 sm:p-8 space-y-4">
        {COMPARE.map((c, i) => {
          const pct = (c.costIndex / max) * 100;
          return (
            <div key={c.name} className="flex items-center gap-3 sm:gap-4">
              <div className="w-24 sm:w-32 font-mono-c text-[11px] sm:text-xs uppercase tracking-widest shrink-0">
                {c.name}
              </div>
              <div className="flex-1 h-8 sm:h-10 bg-bone border-thick border-ink relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : { width: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                  className={`h-full ${c.color === "red" ? "bg-red" : "bg-ink"}`}
                />
              </div>
              <div className="w-12 sm:w-16 text-right font-display text-base sm:text-xl">
                {c.costIndex}
              </div>
            </div>
          );
        })}
      </div>

      {/* Matrix */}
      <div className="mt-10 border-fat border-ink overflow-x-auto bg-paper">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left p-3 sm:p-4 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] border-b-[3px] border-ink">
                Feature
              </th>
              {COMPARE_COLS.map((c, i) => (
                <th
                  key={c}
                  className={`p-3 sm:p-4 font-display uppercase text-sm sm:text-base border-b-[3px] border-ink ${i === 0 ? "bg-red text-paper" : ""
                    }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_MATRIX.map((row, ri) => (
              <tr key={row.feature} className={ri % 2 ? "bg-bone" : ""}>
                <td className="p-3 sm:p-4 font-mono-c text-[11px] sm:text-xs uppercase tracking-[0.2em] border-b border-ink/20">
                  {row.feature}
                </td>
                {row.values.map((v, ci) => (
                  <td
                    key={ci}
                    className={`p-3 sm:p-4 text-center border-b border-ink/20 ${ci === 0 ? "bg-red/10" : ""
                      }`}
                  >
                    {v === true ? (
                      <Check className="w-5 h-5 mx-auto text-red" strokeWidth={3} />
                    ) : v === false ? (
                      <X className="w-5 h-5 mx-auto text-ink/40" strokeWidth={3} />
                    ) : (
                      <span className="font-mono-c text-[10px] uppercase">{v}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* -------------------------------- THESIS ---------------------------------- */

function Thesis() {
  return (
    <section className="bg-red text-paper border-b-[5px] border-ink grain">
      <div className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 md:py-28 grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 md:col-span-2 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">
          The Thesis
        </div>
        <motion.h3
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="col-span-12 md:col-span-10 font-display text-2xl sm:text-4xl md:text-6xl uppercase leading-[0.95]"
        >
          A multimodal trust platform that makes sharing a car with a stranger
          <span className="bg-ink text-red px-2 sm:px-3 mx-1 sm:mx-2 inline-block">
            feel as safe
          </span>
          as sharing an Airbnb.
        </motion.h3>
      </div>
    </section>
  );
}

/* --------------------------------- HOW ------------------------------------ */

function How() {
  return (
    <section id="how" className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 border-b-[5px] border-ink">
      <SectionLabel n="05" label="How It Works" />
      <div className="grid grid-cols-12 gap-0">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`col-span-12 md:col-span-4 border-thick border-ink p-6 sm:p-8 relative ${i === 1 ? "bg-ink text-paper" : "bg-paper"
              } ${i > 0 ? "border-t-0 md:border-t-[3px] md:border-l-0" : ""} md:border-b-[3px]`}
          >
            <div className="font-display text-5xl sm:text-6xl md:text-7xl">{s.n}</div>
            <div className="font-display text-2xl sm:text-3xl uppercase mt-3 sm:mt-4">{s.t}</div>
            <p className="font-sans mt-3 sm:mt-4 text-sm sm:text-base leading-snug">{s.d}</p>
            {i < STEPS.length - 1 && (
              <ArrowRight className="hidden md:block absolute -right-3 top-10 w-6 h-6 bg-paper text-ink" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- ADMIN CONSOLE -------------------------------- */

function AdminConsole() {
  // dynamic example split — derived from FARE_CONFIG, not hardcoded
  const exampleKm = 30;
  const seats = 3;
  const split = calcItterly(exampleKm, seats);
  const members = [
    { name: "SHRUTI S.", verified: true, amount: split },
    { name: "ADITYA PRAKASH.", verified: true, amount: split },
    { name: "DIVYANSH.", verified: true, amount: split },
  ];
  return (
    <section
      id="admin"
      className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 border-b-[5px] border-ink bg-bone grain"
    >
      <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] text-red mb-4">
        // CHAPTER 06 — FOR COMMUNITY ADMINS
      </div>
      <div className="grid grid-cols-12 gap-8 sm:gap-10 items-start">
        {/* Mock group card */}
        <div className="col-span-12 lg:col-span-6 relative">
          <div className="absolute inset-3 bg-red translate-x-3 translate-y-3" />
          <div className="relative border-fat border-ink bg-paper p-5 sm:p-6">
            <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em]">
              PUNE_DAILY_CARPOOL
            </div>
            <div className="font-display text-3xl sm:text-4xl mt-2">142 MEMBERS</div>
            <div className="mt-6 space-y-3">
              {members.map((m) => (
                <div
                  key={m.name}
                  className="border-thick border-ink px-3 py-2 flex items-center justify-between gap-3 bg-paper"
                >
                  <div className="font-mono-c text-xs uppercase">{m.name}</div>
                  <div className="font-mono-c text-[10px] uppercase text-red tracking-widest hidden sm:block">
                    ✓ AADHAAR
                  </div>
                  <div className="font-display text-base">₹{m.amount}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 font-mono-c text-[10px] uppercase tracking-[0.3em] text-ink/60">
              // SPLIT FOR {exampleKm} KM · {seats} SEATS · COMPUTED LIVE
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="col-span-12 lg:col-span-6">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase leading-[0.9]">
            RUN YOUR
            <br />
            <span className="text-red">WHATSAPP CARPOOL</span>
            <br />
            LIKE A STARTUP.
          </h2>
          <p className="mt-5 text-sm sm:text-base max-w-lg leading-snug">
            Already organising rides on WhatsApp or Telegram? itterly's admin console gives your
            community KYC, insurance, automated UPI split and dispute resolution — without leaving
            the chat.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-xl">
            {[
              { icon: Wallet, t: "UPI SPLIT, AUTO-COLLECTED" },
              { icon: IdCard, t: "AADHAAR KYC FOR EVERY MEMBER" },
              { icon: MessageCircle, t: "WHATSAPP / TELEGRAM NATIVE" },
            ].map(({ icon: Icon, t }) => (
              <div
                key={t}
                className="border-thick border-ink bg-paper px-3 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-red text-paper flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                  {t}
                </span>
              </div>
            ))}
          </div>
          <a
            href="#waitlist"
            className="mt-8 inline-flex items-center gap-3 bg-ink text-paper font-mono-c text-xs uppercase tracking-widest px-6 py-4 border-fat border-ink shadow-block-red skew-hover"
          >
            REQUEST ADMIN ACCESS <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- WHY NOW --------------------------------- */

function WhyNow() {
  const items = [
    { k: "APR 2025", v: "Maharashtra carpooling law passes. The legal door is open." },
    { k: "UPI", v: "₹0 friction fare splitting. Already in every phone." },
    { k: "300M+", v: "Private cars on Indian roads. Empty seats compounding daily." },
    { k: "12–18 MO", v: "Window before well-funded competitors react. The moment is now." },
  ];
  return (
    <section id="why" className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 border-b-[5px] border-ink">
      <SectionLabel n="07" label="Why Now" />
      <div className="grid grid-cols-12 gap-5 sm:gap-6">
        {items.map((it, i) => (
          <motion.div
            key={it.k}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className={`col-span-12 sm:col-span-6 lg:col-span-3 border-fat border-ink bg-paper p-5 sm:p-6 ${i % 2 === 1 ? "lg:translate-y-6" : ""
              }`}
          >
            <div className="font-display text-xl sm:text-2xl text-red">{it.k}</div>
            <div className="w-12 h-[3px] bg-ink my-3" />
            <p className="text-sm leading-snug">{it.v}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- WAITLIST --------------------------------- */

function Waitlist({ count, onSignup }: { count: number | null; onSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<"rider" | "driver" | "admin">("rider");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ position: number | null } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const parsed = emailSchema.safeParse({ email, city: city || undefined, role });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.from("waitlist_signups").insert({
        email: parsed.data.email,
        city: parsed.data.city ?? null,
        role: parsed.data.role ?? "rider",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already registered on the waitlist.");
        } else {
          toast.error(error.message);
        }
      } else {
        const { data: c } = await supabase.rpc("get_waitlist_count");
        toast.success("You're in. Welcome to itterly.");
        setDone({ position: typeof c === "number" ? c : null });
        onSignup();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="waitlist"
      className="bg-ink text-paper border-b-[5px] border-ink relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full diag-stripes opacity-10 pointer-events-none" />
      <div className="px-5 sm:px-6 md:px-12 py-16 sm:py-24 grid grid-cols-12 gap-6 sm:gap-8 relative">
        <div className="col-span-12 md:col-span-5">
          <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] text-red">
            // Waitlist
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl uppercase mt-4 leading-[0.9]">
            Reserve
            <br />
            your
            <br />
            <span className="text-red">seat.</span>
          </h2>
          <p className="font-sans mt-5 sm:mt-6 max-w-sm text-sm sm:text-base text-paper/80">
            Early riders get priority access, a founding-member discount, and a permanent place on
            the itterly leaderboard.
          </p>
          {count !== null && (
            <div className="mt-6 font-mono-c text-xs uppercase tracking-[0.3em] text-paper/70 flex items-center gap-2">
              <span className="w-2 h-2 bg-red rounded-full animate-pulse" />
              <AnimatedNumber value={count} className="font-display text-2xl text-red" /> ONBOARD
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-7">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-fat border-paper bg-red p-8"
            >
              <div className="font-mono-c text-xs uppercase tracking-[0.3em]">Confirmed</div>
              <div className="font-display text-5xl mt-3">YOU'RE IN.</div>
              {done.position !== null && (
                <div className="mt-4 font-mono-c">
                  Position{" "}
                  <span className="font-display text-3xl align-middle">
                    #{String(done.position).padStart(4, "0")}
                  </span>{" "}
                  on the list.
                </div>
              )}
              <p className="mt-4 text-paper/90">
                We'll email you the moment itterly opens in your corridor.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="mb-4">
                <span className="font-mono-c text-xs uppercase tracking-[0.3em] block mb-2 text-paper/70">
                  I am signing up as a:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["rider", "driver", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`font-mono-c text-xs sm:text-sm uppercase tracking-widest py-3 border-thick transition-all cursor-pointer ${role === r
                        ? "bg-red text-paper border-paper shadow-[4px_4px_0_0_var(--paper)]"
                        : "bg-paper text-ink border-paper hover:bg-bone"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <label className="col-span-12 md:col-span-7 block">
                  <span className="font-mono-c text-xs uppercase tracking-[0.3em] block mb-2">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@bharat.in"
                    maxLength={255}
                    className="w-full bg-paper text-ink border-fat border-paper px-4 py-4 font-mono-c text-base focus:outline-none focus:border-red"
                  />
                </label>
                <label className="col-span-12 md:col-span-5 block">
                  <span className="font-mono-c text-xs uppercase tracking-[0.3em] block mb-2">
                    Route
                  </span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-paper text-ink border-fat border-paper px-4 py-4 font-mono-c text-base focus:outline-none focus:border-red appearance-none"
                  >
                    <option value="">Any</option>
                    <option>Mumbai – Pune</option>
                    <option>Bengaluru – Mysuru</option>
                    <option>Delhi – Jaipur</option>
                    <option>Chennai – Pondicherry</option>
                    <option>Hyderabad – Vijayawada</option>
                    <option>Bengaluru – Chennai</option>
                    <option>Bengaluru – Hyderabad</option>
                    <option>Delhi – Chandigarh</option>
                    <option>Delhi – Agra</option>
                    <option>Delhi – Dehradun</option>
                    <option>Delhi – Haridwar</option>
                    <option>Mumbai – Surat</option>
                    <option>Mumbai – Nashik</option>
                    <option>Mumbai – Goa</option>
                    <option>Pune – Nashik</option>
                    <option>Pune – Goa</option>
                    <option>Ahmedabad – Vadodara</option>
                    <option>Ahmedabad – Surat</option>
                    <option>Kolkata – Digha</option>
                    <option>Kolkata – Kharagpur</option>
                    <option>Coimbatore – Bengaluru</option>
                    <option>Hyderabad – Warangal</option>
                    <option>Lucknow – Kanpur</option>
                    <option>Patna – Gaya</option>
                    <option>Kochi – Trivandrum</option>
                    <option>Jaipur – Ajmer</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-red text-paper font-mono-c uppercase tracking-[0.3em] text-sm border-fat border-paper px-8 py-5 inline-flex items-center gap-4 skew-hover disabled:opacity-60"
              >
                {loading ? "Reserving…" : "Reserve My Seat"}
                <ArrowUpRight className="w-5 h-5" />
              </button>
              <p className="text-xs font-mono-c text-paper/60 uppercase tracking-widest">
                No spam. One email when we launch in your corridor.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- FOOTER ---------------------------------- */

function Footer() {
  return (
    <footer className="px-5 sm:px-6 md:px-12 py-10 sm:py-12 bg-paper">
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-6">
          <div className="font-display text-5xl sm:text-6xl md:text-8xl lowercase mb-3">
            itterly<span className="text-red">.</span>
          </div>
          <div className="font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] mt-2">
            itterly / © {new Date().getFullYear()} All Rights Reserved
          </div>
        </div>
        <div className="col-span-6 md:col-span-3 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] space-y-2 break-all">
          <a
            href="mailto:adityaprakash06official@gmail.com"
            className="hover:text-red transition-colors underline decoration-thick block"
          >
            adityaprakash06official@gmail.com
          </a>
        </div>
        <div className="col-span-6 md:col-span-3 font-mono-c text-[10px] sm:text-xs uppercase tracking-[0.3em] space-y-2 md:text-right">
          <div>Mumbai · Pune</div>
          <div>Bengaluru · Delhi</div>
        </div>
      </div>
      <div className="border-t-[3px] border-ink mt-8 sm:mt-10 pt-4 font-mono-c text-[9px] sm:text-[10px] uppercase tracking-[0.3em] flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>v0.1 · Pre-launch</span>
          <span className="text-ink/30">•</span>
          <Link to="/terms" className="hover:text-red transition-colors underline decoration-thick">
            Terms of Service
          </Link>
          <span className="text-ink/30">•</span>
          <Link
            to="/privacy"
            className="hover:text-red transition-colors underline decoration-thick"
          >
            Privacy Policy
          </Link>
        </div>
        <span>India / 2026</span>
      </div>
    </footer>
  );
}
