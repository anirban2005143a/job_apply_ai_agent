const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description:
      "Import your resume (PDF or text), LinkedIn profile, portfolio links, GitHub, and any projects. We extract facts only—no embellishments.",
  },
  {
    step: "02",
    title: "Set Your Preferences",
    description:
      "Define your preferences: location, remote preferences, visa status, start date. Set your apply policy with daily limits and match thresholds.",
  },
  {
    step: "03",
    title: "Review Apply Queue",
    description:
      "Our agent searches and ranks jobs, producing a prioritized queue. Each job shows skill overlap, experience fit, and why it matches.",
  },
  {
    step: "04",
    title: "Auto-Apply at Scale",
    description:
      "Watch as applications are submitted with personalized materials. Track status in real-time: queued, submitted, failed, or retried.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header - Left Aligned & Professional */}
        <div className="mb-20 text-left md:max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px w-8 bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">System Protocol</span>
          </div>
          <h2 className="mb-4 text-3xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 md:text-4xl">
            Streamlined <br />
            <span className="italic font-serif text-zinc-400 dark:text-zinc-500">Execution Workflow</span>
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            A precise multi-stage pipeline designed to handle career operations at professional scale.
          </p>
        </div>

        {/* Process Grid - Technical Blueprint Style */}
        <div className="grid border-t border-l border-zinc-200 dark:border-zinc-800 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div 
              key={index} 
              className="group relative border-r border-b border-zinc-200 dark:border-zinc-800 p-8 transition-colors hover:bg-white dark:hover:bg-zinc-900/30"
            >
              {/* Step Identifier - Monospace & Small */}
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                  [{item.step}]
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors" />
              </div>

              {/* Content - Professional Sans-Serif */}
              <h3 className="mb-3 text-[14px] font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h3>
              
              <p className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>

              {/* Interactive Hover Accent */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}