import { FileText, Search, Send, Shield } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Artifact Pack Generator",
    description:
      "Engineered extraction of your career data into structured profiles, bullet banks, and verified proof packs.",
    highlights: ["JSON Profile", "Bullet Bank", "Answer Library", "Proof Pack"],
  },
  {
    icon: Search,
    title: "Intelligence & Ranking",
    description:
      "Autonomous search across primary job sources with deduplication and high-fidelity experience matching.",
    highlights: ["Smart Dedupe", "Match Scoring", "Multi-source", "Filters"],
  },
  {
    icon: Send,
    title: "Auto-Apply Engine",
    description:
      "Precision-tailored resumes and personalized recruiter notes submitted through a secure automation pipeline.",
    highlights: ["Tailored Assets", "Personalized Notes", "Evidence Mapping", "Auto-submit"],
  },
  {
    icon: Shield,
    title: "Safety & Compliance",
    description:
      "Strict policy enforcement including daily submission limits, match thresholds, and a master kill switch.",
    highlights: ["Daily Limits", "Blocklists", "Thresholds", "Kill Switch"],
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header - Formal & Tight Typography */}
        <div className="mb-20 text-left md:max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px w-8 bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Core Capabilities</span>
          </div>
          <h2 className="mb-4 text-3xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 md:text-4xl">
            Search-to-Apply <br/>
            <span className="italic font-medium font-serif text-zinc-400 dark:text-zinc-500">Professional Pipeline</span>
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            A comprehensive automation suite designed for high-volume, high-integrity career operations.
          </p>
        </div>

        {/* Feature Grid - Industrial Table-style Layout */}
        <div className="grid border-t border-l border-zinc-200 dark:border-zinc-800 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group border-r border-b border-zinc-200 dark:border-zinc-800 p-8 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <feature.icon className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              </div>
              
              <h3 className="mb-3 text-[15px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                {feature.title}
              </h3>
              
              <p className="mb-8 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>

              {/* Highlights - Subtle Metadata Tags */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-zinc-100 dark:border-zinc-900 pt-6">
                {feature.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-zinc-300 dark:bg-zinc-700" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}