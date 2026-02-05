const applications = [
  { company: "Stripe", role: "Software Engineer Intern", status: "submitted", match: "92%" },
  { company: "Figma", role: "Product Design Intern", status: "submitted", match: "88%" },
  { company: "Notion", role: "Engineering Intern", status: "submitted", match: "85%" },
  { company: "Linear", role: "Frontend Engineer", status: "queued", match: "82%" },
  { company: "Vercel", role: "Developer Experience", status: "queued", match: "80%" },
  { company: "Supabase", role: "Full Stack Intern", status: "failed", match: "78%" },
];

const statusStyles: Record<string, string> = {
  submitted: "bg-green-500/10 text-green-500 border border-green-500/30",
  queued: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30",
  failed: "bg-red-500/10 text-red-500 border border-red-500/30",
};

export function Tracker() {
  return (
    <section id="tracker" className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header - Technical & Formal */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px w-8 bg-zinc-900 dark:bg-zinc-100" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Audit Trail</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
              Submission Registry
            </h2>
          </div>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-500 font-medium">
            Synchronized with live application threads
          </p>
        </div>

        {/* Table - High Density & Sharp Borders */}
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Entity</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Position</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Match</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {applications.map((app, index) => (
                <tr key={index} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                    {app.company}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-zinc-600 dark:text-zinc-400">
                    {app.role}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-500">
                      {app.match}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${statusStyles[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Summary Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 border-t border-zinc-100 dark:border-zinc-900 pt-8">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">3 Executed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">2 In Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">1 Fault (Auto-Retry)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
