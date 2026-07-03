import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@studio/ui";
import { motion } from "framer-motion";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  description,
  children,
  footer,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="shadow-[4px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)] border-2 border-border/50 bg-background/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold font-sans tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <CardFooter className="flex flex-col gap-4 pb-6">{footer}</CardFooter>
        )}
      </Card>
    </motion.div>
  );
};
