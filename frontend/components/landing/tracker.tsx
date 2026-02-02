const applications = [
  { company: "Stripe", role: "Software Engineer Intern", status: "submitted", match: "92%" },
  { company: "Figma", role: "Product Design Intern", status: "submitted", match: "88%" },
  { company: "Notion", role: "Engineering Intern", status: "submitted", match: "85%" },
  { company: "Linear", role: "Frontend Engineer", status: "queued", match: "82%" },
  { company: "Vercel", role: "Developer Experience", status: "queued", match: "80%" },
  { company: "Supabase", role: "Full Stack Intern", status: "failed", match: "78%" },
];

const statusStyles: Record<string, string> = {
  submitted: "bg-green-500/10 text-green-500",
  queued: "bg-yellow-500/10 text-yellow-500",
  failed: "bg-red-500/10 text-red-500",
};

export function Tracker() {
  return (
    <section className="border-t border-border bg-card py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Track every application
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Real-time status updates, submission receipts, and complete audit trail 
            for every application in your queue.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 gap-4 border-b border-border bg-secondary px-6 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Company</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Match</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</span>
          </div>
          <div className="divide-y divide-border">
            {applications.map((app, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 px-6 py-4">
                <span className="font-medium text-foreground">{app.company}</span>
                <span className="truncate text-sm text-muted-foreground">{app.role}</span>
                <span className="font-mono text-sm text-foreground">{app.match}</span>
                <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs capitalize ${statusStyles[app.status]}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>3 Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>2 Queued</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>1 Failed (will retry)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
