import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative border-t border-border bg-background py-24 md:py-40">
      {/* Subtle Background Detail - Vertical Lines for a "Grid" Feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
        <div className="absolute left-1/4 h-full w-px bg-foreground" />
        <div className="absolute right-1/4 h-full w-px bg-foreground" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="mb-10 flex items-center gap-3 border border-border bg-secondary/30 px-4 py-1.5 transition-colors hover:bg-secondary/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/20 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/80"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70">
              System Ready
            </span>
          </div>

          <h2 className="mb-6 max-w-4xl text-balance text-4xl font-medium tracking-tighter text-foreground md:text-6xl lg:text-7xl">
            Transition from volume to <br />
            <span className="italic font-serif text-muted-foreground">verified precision.</span>
          </h2>

          <p className="mx-auto mb-12 max-w-xl text-sm leading-relaxed tracking-tight text-muted-foreground md:text-base">
            Join the elite cohort of students automating their search through a truthful, 
            high-integrity pipeline. Deploy your agent today.
          </p>

          <div className="flex flex-col items-center justify-center gap-0 sm:flex-row">
            {/* Primary Button - Sharp Edges */}
            <Button 
              size="lg" 
              className="h-14 rounded-none border border-primary bg-primary px-10 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-transparent hover:text-primary sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {/* Secondary Button - Sharp Edges */}
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 rounded-none border-l-0 border-border bg-transparent px-10 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-secondary hover:text-foreground max-sm:border-l max-sm:border-t-0 sm:w-auto"
            >
              View Documentation
            </Button>
          </div>

          {/* Footer Detail */}
          <div className="mt-16 flex items-center gap-4">
            <div className="h-px w-8 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
              JobPilot Terminal v2.0.26
            </span>
            <div className="h-px w-8 bg-border" />
          </div>
        </div>
      </div>
    </section>
  );
}