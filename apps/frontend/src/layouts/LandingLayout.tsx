import * as React from "react";
import { Outlet } from "react-router-dom";

/**
 * LandingLayout — Phase 2
 *
 * The navigation and footer are now owned by the Landing feature itself
 * (features/landing/components/LandingNav.tsx & LandingFooter.tsx)
 * for full cinematic control. This layout only provides the scroll container.
 */
export const LandingLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Outlet />
    </div>
  );
};

export default LandingLayout;
