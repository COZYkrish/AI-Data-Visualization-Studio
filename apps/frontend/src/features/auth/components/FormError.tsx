import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
