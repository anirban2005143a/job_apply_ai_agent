import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";

export function Hero() {
  return (
    <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] pt-24 pb-0 md:pt-36 transition-colors duration-300">
      {/* Structural Grid Detail */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
        <div className="absolute left-0 top-0 h-full w-full bg-[grid] grid grid-cols-8 divide-x divide-zinc-900 dark:divide-zinc-100">
          <div /><div /><div /><div /><div /><div /><div /><div />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          
          {/* Tagline Badge */}
          <div className="mb-6 inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-3 py-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Protocol v4.0 Active
            </span>
          </div>

          <h1 className="mb-6 max-w-4xl text-balance text-4xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 md:text-5xl lg:text-6xl">
            Autonomous systems for <br />
            <span className="italic font-serif text-zinc-400 dark:text-zinc-500">high-integrity career growth.</span>
          </h1>

          <p className="mb-10 max-w-xl text-sm leading-relaxed tracking-tight text-zinc-600 dark:text-zinc-400 md:text-base">
            JobPilot is a professional-grade execution engine. We replace manual 
            repetitive application labor with a verified, factual automation pipeline.
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-0 sm:flex-row">
            <a href="/apply" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="h-12 cursor-pointer w-full rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 px-8 text-[11px] font-bold uppercase tracking-widest text-zinc-50 dark:text-black transition-all hover:bg-transparent hover:text-zinc-900 dark:hover:text-zinc-100 sm:w-auto"
              >
                <Terminal className="mr-2 h-3.5 w-3.5" />
                State Apply to Jobs
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 cursor-pointer w-full rounded-none border-l-0 border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 max-sm:border-l max-sm:border-t-0 sm:w-auto"
            >
              System Overview
            </Button>
          </div>
        </div>

        {/* Stats Section - Multi-mode Adaptable */}
        <div className="grid grid-cols-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/50 md:grid-cols-4">
          {[
            { value: "12.4k", label: "Nodes Processed" },
            { value: "100%", label: "Fact Grounding" },
            { value: "24ms", label: "Latency" },
            { value: "v2.06", label: "Engine Build" },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 py-8 last:border-r-0 hover:bg-white dark:hover:bg-zinc-900/50 transition-colors"
            >
              <div className="text-xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-200 md:text-2xl">
                {stat.value}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}