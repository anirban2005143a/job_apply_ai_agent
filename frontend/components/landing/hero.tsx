import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-muted/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Fully autonomous job applications</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Your AI agent for
            <br />
            <span className="text-muted-foreground">job applications</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Stop wasting weeks on repetitive applications. JobPilot creates your materials,
            finds matching jobs, and applies automatically—all while staying truthful and organized.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Link to login page so users can sign in/start onboarding */}
            <a href="/login">
              <Button size="lg" className="gap-2">
                Start Applying
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Button variant="outline" size="lg" className="bg-transparent">
              See Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-6 border-t border-border pt-10 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
          {[
            { value: "10x", label: "faster than manual" },
            { value: "100%", label: "truthful applications" },
            { value: "1000s", label: "of jobs searched" },
            { value: "0", label: "fabricated claims" },
          ].map((stat, index) => (
            <div key={index} className="text-center md:px-8">
              <div className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
