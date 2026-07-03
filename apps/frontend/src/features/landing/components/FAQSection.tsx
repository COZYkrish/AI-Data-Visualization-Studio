import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { GeometricStar, GeometricCross } from "./shared/GeometricDecorations";

const FAQS = [
  {
    q: "What file formats do you support?",
    a: "We support CSV, XLSX (Excel), and JSON files. You can upload files up to 500 MB on the free plan, and up to 2 GB on Professional and Enterprise plans. We're adding Parquet and SQL database connectors soon.",
  },
  {
    q: "How does the AI cleaning work?",
    a: "Our AI pipeline automatically detects column types, fills missing values using statistical imputation, removes exact and near-duplicate rows, normalizes inconsistent formatting (e.g. date formats, casing), and generates a full audit report of every change made.",
  },
  {
    q: "Can I try predictive modeling without a data science background?",
    a: "Yes! Our platform automatically selects the best model for your data — you don't need to choose between Linear Regression, XGBoost, or ARIMA. Simply select your target column and click 'Generate Forecast.' We present results in plain English with confidence intervals.",
  },
  {
    q: "Is my data secure and private?",
    a: "Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II compliant and GDPR-ready. Your datasets are stored in isolated environments — never shared between accounts. Enterprise plans support on-premise deployment.",
  },
  {
    q: "Can I share dashboards with my team or external stakeholders?",
    a: "Yes. You can create shareable public links, password-protected links, or invite team members to your workspace. Enterprise plans support SSO and granular role-based access control.",
  },
  {
    q: "What happens to my data if I cancel my subscription?",
    a: "You have 30 days after cancellation to export all your datasets, dashboards, and reports. After that, your data is permanently deleted from our systems. We never use your data for training AI models.",
  },
  {
    q: "Do you offer an API for programmatic access?",
    a: "Yes. Professional and Enterprise plans include a full REST API for uploading datasets, triggering analysis, and retrieving results. We also provide a Python SDK and webhook support for integrating with your data pipelines.",
  },
  {
    q: "What's the difference between the Professional and Enterprise plans?",
    a: "Professional is ideal for teams of up to 10 people who need AI-powered analysis and predictive modeling. Enterprise adds SSO, on-premise deployment, custom data connectors, dedicated SLAs, and unlimited team seats with a dedicated account manager.",
  },
];

// ─── Single FAQ item ──────────────────────────────────────────────────────────
const FAQItem: React.FC<{
  item: { q: string; a: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, index, isOpen, onToggle }) => (
  <motion.div
    className={`rounded-2xl border-2 overflow-hidden transition-colors duration-200 ${
      isOpen
        ? "border-landing-violet/40 bg-white"
        : "border-landing-border bg-white/70 hover:border-landing-violet/20"
    }`}
    style={isOpen ? { boxShadow: "4px 4px 0px #7C3AED60" } : {}}
    layout
  >
    <button
      className="w-full flex items-center gap-4 p-5 text-left group"
      onClick={onToggle}
      aria-expanded={isOpen}
      id={`faq-item-${index}`}
    >
      {/* Number indicator */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-outfit font-black text-sm transition-colors duration-200 ${
          isOpen
            ? "bg-landing-violet text-white"
            : "bg-landing-border text-foreground/50 group-hover:bg-landing-violet/10 group-hover:text-landing-violet"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      <span
        className={`flex-1 font-outfit font-bold text-base transition-colors duration-200 ${isOpen ? "text-landing-violet" : "text-foreground"}`}
      >
        {item.q}
      </span>

      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0"
      >
        {isOpen ? (
          <Minus className="w-5 h-5 text-landing-violet" />
        ) : (
          <Plus className="w-5 h-5 text-foreground/40 group-hover:text-landing-violet" />
        )}
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="px-5 pb-5 pl-[60px] text-sm text-foreground/65 font-jakarta leading-relaxed">
            {item.a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── FAQ Section ──────────────────────────────────────────────────────────────
export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section
      className="relative py-24 md:py-32 landing-bg-warm overflow-hidden"
      id="faq"
      aria-label="Frequently asked questions"
    >
      {/* Decorations */}
      <div className="absolute top-16 right-8 pointer-events-none">
        <GeometricStar
          size={32}
          color="#FBBF24"
          opacity={0.45}
          float
          floatIndex={2}
        />
      </div>
      <div className="absolute bottom-16 left-8 pointer-events-none">
        <GeometricCross
          size={26}
          color="#7C3AED"
          opacity={0.3}
          float
          floatIndex={4}
        />
      </div>
      <div className="absolute top-1/3 left-6 pointer-events-none">
        <GeometricStar
          size={18}
          color="#F43F5E"
          opacity={0.4}
          float
          floatIndex={6}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionWrapper className="text-center mb-14">
          <div className="text-4xl mb-4">🙋</div>
          <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight mb-4">
            Frequently Asked{" "}
            <span className="text-gradient-vivid">Questions.</span>
          </h2>
          <p className="text-foreground/60 font-jakarta">
            Can&apos;t find your answer?{" "}
            <a
              href="mailto:hello@studio.ai"
              className="text-landing-violet font-medium hover:underline"
            >
              Email us →
            </a>
          </p>
        </SectionWrapper>

        {/* FAQ list */}
        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
