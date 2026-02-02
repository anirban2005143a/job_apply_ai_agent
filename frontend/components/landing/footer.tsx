export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">JP</span>
            </div>
            <span className="text-lg font-semibold text-foreground">JobPilot</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#safety" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Safety
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Documentation
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              GitHub
            </a>
          </nav>

          <p className="text-sm text-muted-foreground">
            Built for students, by students.
          </p>
        </div>
      </div>
    </footer>
  );
}
