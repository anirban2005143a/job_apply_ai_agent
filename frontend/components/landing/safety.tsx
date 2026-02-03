import { Check } from "lucide-react";

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
    <section id="safety" className="border-t border-border py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
              <span className="text-xs text-muted-foreground">Safe by design</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
              Autonomous doesn{"'"}t mean uncontrolled
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              No per-application approval needed, but you{"'"}re always in control. 
              Set your policy once, and the agent operates strictly within your boundaries.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {safetyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Check className="h-3 w-3 text-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Apply Policy</h3>
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">Active</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm text-muted-foreground">Max applications/day</span>
                <span className="font-mono text-sm text-foreground">50</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm text-muted-foreground">Min match threshold</span>
                <span className="font-mono text-sm text-foreground">75%</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="font-mono text-sm text-foreground">Remote / SF Bay Area</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm text-muted-foreground">Blocked roles</span>
                <span className="font-mono text-sm text-foreground">Sales, Support</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kill switch</span>
                <div className="h-5 w-9 rounded-full bg-green-500/20 p-0.5">
                  <div className="ml-auto h-4 w-4 rounded-full bg-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
