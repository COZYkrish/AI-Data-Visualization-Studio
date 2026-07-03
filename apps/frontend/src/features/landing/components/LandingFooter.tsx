import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Github, Twitter, Send } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
    { label: "Status", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "Community", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

// ─── Landing Footer ────────────────────────────────────────────────────────────
export const LandingFooter: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer
      className="relative py-20 overflow-hidden"
      style={{ backgroundColor: "#0B0A12" }}
      aria-label="Site footer"
    >
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-landing-violet/30 to-transparent" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-landing-violet/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-5 w-fit">
              <div className="w-9 h-9 rounded-xl bg-landing-violet flex items-center justify-center shadow-hard-violet">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-outfit font-bold text-xl tracking-tight">
                <span className="text-landing-violet-light">Studio</span>
                <span className="text-white">.ai</span>
              </span>
            </Link>

            <p className="text-white/40 text-sm font-jakarta leading-relaxed mb-7 max-w-xs">
              Turn raw, chaotic data into clear, confident decisions. Built for
              data teams who don&apos;t have time to waste.
            </p>

            {/* Newsletter */}
            <div>
              <div className="text-xs font-bold font-outfit uppercase tracking-widest text-white/30 mb-3">
                Stay in the loop
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex gap-2"
                id="footer-newsletter"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-jakarta placeholder:text-white/25 focus:outline-none focus:border-landing-violet/50 focus:bg-white/8 transition-colors"
                  aria-label="Email for newsletter"
                />
                <motion.button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-landing-violet text-white flex items-center gap-2 text-sm font-outfit font-bold shadow-hard-violet hover:shadow-none transition-all duration-200"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Subscribe to newsletter"
                >
                  {submitted ? "✓" : <Send className="w-4 h-4" />}
                </motion.button>
              </form>
              {submitted && (
                <motion.p
                  className="text-landing-emerald text-xs font-jakarta mt-2"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  You&apos;re subscribed! 🎉
                </motion.p>
              )}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                aria-label="GitHub"
                id="footer-github"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                aria-label="Twitter"
                id="footer-twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <div className="text-xs font-black uppercase tracking-widest text-white/30 font-outfit mb-5">
                {category}
              </div>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/45 hover:text-white font-jakarta transition-colors duration-200 hover:underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25 font-jakarta">
            © {new Date().getFullYear()} AI Data Visualization Studio. All
            rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/25 font-jakarta">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-landing-pink"
            >
              ♥
            </motion.span>
            <span>for data teams everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
