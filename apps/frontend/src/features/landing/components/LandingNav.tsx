import * as React from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Sparkles, Menu, X, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#upload" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <>
      <motion.header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div
          className={`mx-4 sm:mx-6 lg:mx-8 mt-3 rounded-2xl transition-all duration-500 ${
            scrolled
              ? "bg-white/80 dark:bg-[#0B0A12]/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-float"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              id="nav-logo"
            >
              <motion.div
                className="w-8 h-8 rounded-xl bg-landing-violet flex items-center justify-center shadow-hard-violet"
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-outfit font-bold text-lg tracking-tight">
                <span className="text-landing-violet">Studio</span>
                <span className="text-foreground">.ai</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  className="nav-link px-4 py-2 rounded-lg hover:bg-landing-violet/5 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" id="nav-signin">
                <motion.button
                  className="text-sm font-medium px-4 py-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
              </Link>
              <Link to="/register" id="nav-get-started">
                <motion.button
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-landing-violet text-white shadow-hard-violet hover:shadow-hard-lg-violet transition-all duration-200 group"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Started
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <motion.button
              className="md:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              whileTap={{ scale: 0.95 }}
              id="nav-mobile-toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-x-4 top-20 z-40 rounded-2xl bg-white/95 dark:bg-[#0B0A12]/95 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-float p-4 flex flex-col gap-2"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-landing-violet/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-border/40 mt-2 pt-3 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border border-border hover:bg-black/5 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <button className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl bg-landing-violet text-white shadow-hard-violet">
                  Get Started Free →
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
