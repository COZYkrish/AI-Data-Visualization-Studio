import * as React from "react";
import { LandingNav } from "./components/LandingNav";
import { HeroScene } from "./components/HeroScene";
import { UploadScene } from "./components/UploadScene";
import { IntelligenceScene } from "./components/IntelligenceScene";
import { PredictScene } from "./components/PredictScene";
import { DecisionsScene } from "./components/DecisionsScene";
import { PricingSection } from "./components/PricingSection";
import { FAQSection } from "./components/FAQSection";
import { LandingFooter } from "./components/LandingFooter";

/**
 * Landing — Phase 2 Cinematic Landing Page
 *
 * Scene narrative:
 *   Scene 1 (Hero)         → Data Chaos — the problem is real
 *   Scene 2 (Upload)       → Drop it, we handle everything
 *   Scene 3 (Intelligence) → AI awakens, insights emerge
 *   Scene 4 (Predict)      → See what's coming next
 *   Scene 5 (Decisions)    → Full circle → confident decisions
 *   Pricing + FAQ + Footer
 */
export const Landing: React.FC = () => {
  return (
    <>
      {/* Cinematic sticky nav */}
      <LandingNav />

      {/* Main page content */}
      <main>
        {/* Scene 1 — Hero: Data Chaos */}
        <HeroScene />

        {/* Scene 2 — Upload & Cleaning */}
        <UploadScene />

        {/* Scene 3 — Intelligence Awakens */}
        <IntelligenceScene />

        {/* Scene 4 — Predict the Future */}
        <PredictScene />

        {/* Scene 5 — Turn Data Into Decisions */}
        <DecisionsScene />

        {/* Pricing */}
        <PricingSection />

        {/* FAQ */}
        <FAQSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </>
  );
};

export default Landing;
