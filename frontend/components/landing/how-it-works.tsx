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
    <section id="how-it-works" className="border-t border-border bg-card py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            From resume to submitted in minutes
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            A streamlined workflow that handles everything from profile creation to application tracking.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="mb-4 text-5xl font-bold text-muted-foreground/20">{item.step}</div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-8 bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
