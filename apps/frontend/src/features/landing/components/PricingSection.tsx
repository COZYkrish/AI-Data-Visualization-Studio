import * as React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
import {
  SectionWrapper,
  StaggerContainer,
  StaggerItem,
} from "./shared/SectionWrapper";
import {
  GeometricCircle,
  GeometricStar,
  GeometricPill,
} from "./shared/GeometricDecorations";

// ─── Pricing plan data ─────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  icon: React.ReactNode;
  monthlyPrice: number;
  yearlyPrice: number;
  tagline: string;
  color: string;
  featured?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    icon: <Zap className="w-5 h-5 text-landing-emerald" />,
    monthlyPrice: 0,
    yearlyPrice: 0,
    tagline: "Perfect for individuals exploring their data.",
    color: "#10B981",
    features: [
      "Upload up to 5 datasets/month",
      "CSV, XLSX, JSON support",
      "Auto-cleaning & validation",
      "3 dashboard templates",
      "Basic statistical analysis",
      "PNG export",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaHref: "/register",
  },
  {
    id: "professional",
    name: "Professional",
    icon: <Sparkles className="w-5 h-5 text-white" />,
    monthlyPrice: 49,
    yearlyPrice: 39,
    tagline: "For data teams who need advanced AI capabilities.",
    color: "#7C3AED",
    featured: true,
    features: [
      "Unlimited datasets",
      "All file formats + API",
      "AI insights & anomaly detection",
      "Predictive models (Regression, Time Series)",
      "Unlimited custom dashboards",
      "PDF + CSV + PNG export",
      "Team collaboration (up to 10)",
      "Priority email support",
    ],
    cta: "Start 14-day Trial",
    ctaHref: "/register?plan=pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: <Building2 className="w-5 h-5 text-landing-cyan" />,
    monthlyPrice: 199,
    yearlyPrice: 159,
    tagline: "Custom infrastructure for large organizations.",
    color: "#06B6D4",
    features: [
      "Everything in Professional",
      "SSO / SAML integration",
      "Custom data connectors",
      "On-premise deployment option",
      "Dedicated ML pipelines",
      "SLA 99.99% uptime guarantee",
      "Unlimited team seats",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    ctaHref: "/contact",
  },
];

// ─── Plan card component ───────────────────────────────────────────────────────
const PlanCard: React.FC<{
  plan: Plan;
  yearly: boolean;
  delay: number;
}> = ({ plan, yearly, delay }) => {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const isFree = price === 0;

  return (
    <motion.div
      className={`relative rounded-3xl p-7 flex flex-col ${
        plan.featured
          ? "bg-landing-violet text-white border-2 border-landing-violet"
          : "bg-white border-2 border-landing-border text-foreground"
      }`}
      style={{
        boxShadow: plan.featured
          ? `6px 6px 0px ${plan.color}80, 0 20px 60px rgba(124,58,237,0.3)`
          : `4px 4px 0px ${plan.color}60`,
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4 }}
    >
      {/* Featured badge */}
      {plan.featured && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-landing-yellow text-foreground text-xs font-black font-outfit"
          style={{ boxShadow: "2px 2px 0px #d97706" }}
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ⭐ Most Popular
        </motion.div>
      )}

      {/* Plan header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: plan.featured
              ? "rgba(255,255,255,0.15)"
              : `${plan.color}15`,
          }}
        >
          {plan.icon}
        </div>
        <div>
          <div
            className={`font-outfit font-black text-lg ${plan.featured ? "text-white" : "text-foreground"}`}
          >
            {plan.name}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={price}
            className="font-outfit font-black text-4xl"
            style={{ color: plan.featured ? "white" : plan.color }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            {isFree ? "Free" : `$${price}`}
          </motion.div>
        </AnimatePresence>
        {!isFree && (
          <div
            className={`text-sm font-jakarta mt-1 ${plan.featured ? "text-white/60" : "text-foreground/50"}`}
          >
            /month · {yearly ? "billed annually" : "billed monthly"}
            {yearly && (
              <span className="ml-2 text-landing-emerald font-bold text-xs">
                Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tagline */}
      <p
        className={`text-sm font-jakarta mb-6 ${plan.featured ? "text-white/70" : "text-foreground/60"}`}
      >
        {plan.tagline}
      </p>

      {/* Feature list */}
      <ul className="flex flex-col gap-2.5 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm font-jakarta">
            <Check
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: plan.featured ? "#A78BFA" : plan.color }}
            />
            <span
              className={plan.featured ? "text-white/80" : "text-foreground/70"}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link to={plan.ctaHref} id={`pricing-cta-${plan.id}`}>
        <motion.button
          className={`w-full py-3.5 rounded-2xl font-outfit font-bold text-sm transition-all duration-200 ${
            plan.featured
              ? "bg-white text-landing-violet hover:bg-landing-yellow hover:text-foreground"
              : `border-2 hover:bg-black/5`
          }`}
          style={
            !plan.featured
              ? { borderColor: `${plan.color}50`, color: plan.color }
              : {}
          }
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          {plan.cta}
        </motion.button>
      </Link>
    </motion.div>
  );
};

// ─── Pricing Section ───────────────────────────────────────────────────────────
export const PricingSection: React.FC = () => {
  const [yearly, setYearly] = React.useState(false);

  return (
    <section
      className="relative py-24 md:py-32 landing-bg-warm overflow-hidden"
      id="pricing"
      aria-label="Pricing section"
    >
      {/* Decorations */}
      <div className="absolute top-12 left-8 pointer-events-none">
        <GeometricStar
          size={36}
          color="#FBBF24"
          opacity={0.5}
          float
          floatIndex={1}
        />
      </div>
      <div className="absolute bottom-20 right-8 pointer-events-none opacity-60">
        <GeometricCircle size={160} color="#7C3AED" opacity={0.08} filled />
      </div>
      <div className="absolute top-1/3 right-4 pointer-events-none">
        <GeometricPill
          width={80}
          height={28}
          color="#F43F5E"
          opacity={0.3}
          float
          floatIndex={3}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionWrapper className="text-center mb-12">
          <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight mb-5">
            Simple,{" "}
            <span className="text-gradient-vivid">Transparent Pricing.</span>
          </h2>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto font-jakarta">
            Start free. Upgrade when you need it. No surprise bills.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 mt-8 p-1.5 rounded-xl bg-white border border-landing-border">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-outfit font-bold transition-all duration-200 ${
                !yearly
                  ? "bg-landing-violet text-white shadow-hard-violet"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-outfit font-bold transition-all duration-200 flex items-center gap-2 ${
                yearly
                  ? "bg-landing-violet text-white shadow-hard-violet"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Yearly
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-landing-emerald/20 text-landing-emerald">
                Save 20%
              </span>
            </button>
          </div>
        </SectionWrapper>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              delay={0.1 + i * 0.1}
            />
          ))}
        </div>

        {/* Enterprise note */}
        <SectionWrapper className="text-center mt-10" delay={0.2}>
          <p className="text-sm text-foreground/50 font-jakarta">
            All plans include a 14-day free trial. No credit card required for
            Starter.{" "}
            <a
              href="#faq"
              className="text-landing-violet font-medium hover:underline"
            >
              Have questions?
            </a>
          </p>
        </SectionWrapper>
      </div>
    </section>
  );
};
