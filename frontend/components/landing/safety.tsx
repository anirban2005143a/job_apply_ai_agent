import { Activity, Check, ShieldCheck } from "lucide-react";

const safetyFeatures = [
  "Zero hallucinated credentials—every claim grounded in your profile",
  "Explicit apply policy you set once at onboarding",
  "Maximum applications per day limit",
  "Minimum match threshold to apply",
  "Blocked companies and role types",
  "Required preferences (location, remote, visa, start date)",
  "Instant kill switch to stop all applications",
  "Complete audit trail with submission receipts",
];

export function Safety() {
  return (
    <section id="safety" className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          
          {/* Left Side: Professional Summary */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Governance Layer</span>
            </div>
            
            <h2 className="mb-6 text-3xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 md:text-4xl">
              Autonomous execution <br />
              <span className="italic font-serif text-zinc-400 dark:text-zinc-500">within human boundaries.</span>
            </h2>
            
            <p className="mb-10 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-lg">
              JobPilot operates on a "Trust but Verify" architecture. While the agent executes 
              at scale, it remains bound by an immutable policy set during your initial onboarding.
            </p>

            {/* Feature List - Structured Grid */}
            <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2 border-t border-zinc-100 dark:border-zinc-900 pt-8">
              {safetyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-3 w-3 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span className="text-[13px] font-medium  tracking-tight text-zinc-500 dark:text-zinc-400">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Policy Console UI */}
          <div className="rounded-xl overflow-hidden border border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between border-b border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 px-6 py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-zinc-100 dark:text-zinc-900" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-100 dark:text-zinc-900">Active Apply Policy</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {[
                { label: "Max Daily Applications", val: "50", unit: "req/24h" },
                { label: "Min Match Threshold", val: "85%", unit: "score" },
                { label: "Geographic Constraints", val: "Remote/EMEA", unit: "zone" },
                { label: "Entity Exclusions", val: "Active", unit: "blocklist" },
              ].map((item, i) => (
                <div key={i} className="group flex items-end justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{item.label}</span>
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{item.val}</span>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-300 dark:text-zinc-700 uppercase">{item.unit}</span>
                </div>
              ))}

              <div className="pt-4">
                <div className="flex rounded-md items-center justify-between border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">Emergency Stop</span>
                    <span className="text-[9px] text-red-500/70 uppercase">Immediate termination of all threads</span>
                  </div>
                  <div className="h-6 w-11 border rounded-xl border-red-600 dark:border-red-400 p-1 flex items-center justify-end">
                    <div className="h-full w-4 rounded-full bg-red-600 dark:bg-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}