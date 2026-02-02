"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // read persisted "signed up / logged in" user
    const e = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
    setUserEmail(e);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">JP</span>
          </div>
          <span className="text-lg font-semibold text-foreground">JobPilot</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#safety" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Safety
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {userEmail ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                title={userEmail}
                onClick={() => {/* optionally open profile menu */}}
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-foreground text-background font-semibold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block truncate max-w-[10rem]">
                  {userEmail}
                </span>
              </button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.push("/login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => router.push("/login")}>Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#features" className="text-sm text-muted-foreground">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground">How It Works</a>
            <a href="#safety" className="text-sm text-muted-foreground">Safety</a>

            <div className="flex flex-col gap-2 pt-4">
              {userEmail ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-foreground text-background font-semibold">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm truncate">{userEmail}</div>
                  </div>
                  <Button size="sm" onClick={handleSignOut}>Sign out</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setMobileMenuOpen(false); router.push("/login"); }}>Log in</Button>
                  <Button size="sm" onClick={() => { setMobileMenuOpen(false); router.push("/login"); }}>Get Started</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
