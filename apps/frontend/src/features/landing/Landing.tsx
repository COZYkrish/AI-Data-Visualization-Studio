import * as React from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent } from "@studio/ui";
import {
  Database,
  TrendingUp,
  BarChart2,
  Shield,
  PlayCircle,
} from "lucide-react";

export const Landing: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />

      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans mb-6">
          Visualize and Analyze Your Data <br />
          <span className="text-gradient">With AI Power</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
          Upload your datasets, discover hidden patterns automatically, and
          build stunning, interactive dashboards in seconds. Built for
          developers and data teams.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto font-semibold">
              Get Started Free
            </Button>
          </Link>
          <a href="#demo">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </Button>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-20 border-t bg-card text-card-foreground"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Turn Raw Files Into Business Intelligence
            </h2>
            <p className="text-muted-foreground mt-4">
              Everything you need to analyze, validate, share, and scale your
              data pipelines without complex configurations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <CardContent className="pt-6">
                <Database className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Smart Ingestion</h3>
                <p className="text-sm text-muted-foreground">
                  Support for CSV, XLSX, and JSON files. Validation occurs
                  during upload.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <CardContent className="pt-6">
                <BarChart2 className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Dynamic Dashboards</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive charts generated on-the-fly and fully customized
                  to your schema structure.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">AI Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Statistical metrics, anomaly detection, and correlation
                  summaries extracted automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground">
                  Role-based access controls, protected workspace isolation, and
                  custom data tokens.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Landing;
