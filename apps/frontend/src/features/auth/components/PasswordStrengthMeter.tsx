import * as React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password = "",
}) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;

  const criteria = [
    { label: "8+ characters", met: hasLength },
    { label: "Uppercase letter", met: hasUppercase },
    { label: "Lowercase letter", met: hasLowercase },
    { label: "Number", met: hasNumber },
    { label: "Special character", met: hasSpecial },
  ];

  const score = criteria.filter((c) => c.met).length;

  const getStrengthLabel = () => {
    if (score === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 4) return "Fair";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (score <= 2) return "bg-destructive";
    if (score <= 4) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3 mt-2">
      <div className="flex justify-between items-center text-xs font-medium">
        <span className="text-muted-foreground">Password strength</span>
        <span
          className={
            score === 5
              ? "text-green-600 dark:text-green-400 font-bold"
              : "text-muted-foreground"
          }
        >
          {getStrengthLabel()}
        </span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="h-full flex-1 rounded-full bg-secondary overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: score >= level ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
              className={`h-full ${getStrengthColor()}`}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {criteria.map((criterion, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 ${
              criterion.met
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {criterion.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{criterion.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
