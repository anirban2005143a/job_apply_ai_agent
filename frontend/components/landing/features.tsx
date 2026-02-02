import { FileText, Search, Send, Shield } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Artifact Pack Generator",
    description:
      "Upload your resume and we create a reusable pack: structured profile, bullet bank, answer library, and proof pack. All grounded in your real experience.",
    highlights: ["Structured JSON Profile", "Bullet Bank", "Answer Library", "Proof Pack"],
  },
  {
    icon: Search,
    title: "Job Search & Ranking",
    description:
      "Our agent searches multiple job sources, deduplicates listings, and ranks them based on skill overlap, experience fit, and your constraints.",
    highlights: ["Multi-source Search", "Smart Deduplication", "Match Scoring", "Constraint Filtering"],
  },
  {
    icon: Send,
    title: "Auto-Apply Engine",
    description:
      "For every job in your queue, we generate tailored resumes, personalized notes, and requirement-to-evidence maps—then submit automatically.",
    highlights: ["Tailored Resumes", "Recruiter Notes", "Evidence Mapping", "Auto-submission"],
  },
  {
    icon: Shield,
    title: "Safety by Design",
    description:
      "Set your apply policy once: max applications per day, minimum match threshold, blocked companies, and a kill switch. We never exceed your boundaries.",
    highlights: ["Daily Limits", "Match Thresholds", "Blocklists", "Kill Switch"],
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Complete search-to-apply pipeline
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything you need to automate your job search, from building your application
            materials to tracking submissions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-lg border border-border bg-card p-8 transition-colors hover:border-muted-foreground/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mb-6 text-muted-foreground">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.highlights.map((highlight, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
