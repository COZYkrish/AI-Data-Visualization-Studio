import * as React from "react";
import { motion } from "framer-motion";
import { ProfileCard } from "./components/ProfileCard";
import { SessionsCard } from "./components/SessionsCard";

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-sans">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings, profile, and security preferences.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <ProfileCard />
        <SessionsCard />
      </motion.div>
    </div>
  );
};
