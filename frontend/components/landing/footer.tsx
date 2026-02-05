export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-zinc-900 dark:bg-zinc-100">
              <span className="text-[9px] font-black text-white dark:text-black">JP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                JobPilot
              </span>
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                Autonomous Systems
              </span>
            </div>
          </div>

          {/* Structured Navigation */}
          <nav className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Safety", href: "#safety" },
              { label: "Documentation", href: "#" },
              { label: "GitHub", href: "#" },
            ].map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Corporate Attribution */}
          <div className="flex flex-col items-start md:items-end gap-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Built for high-integrity career operations.
            </p>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                © 2024 JP Engineering
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Utility Bar */}
        <div className="mt-12 border-t border-zinc-100 dark:border-zinc-900 pt-8 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-6">
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 hover:underline cursor-pointer">Privacy Policy</span>
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 hover:underline cursor-pointer">Terms of Service</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-800">
              System Status: Nominal
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500/50" />
          </div>
        </div>
      </div>
    </footer>
  );
}