"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut, User, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<number | boolean>(-1);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = getCookie("token");
    const user_id = getCookie("user_id");
    setLoggedIn(!!(token && user_id));
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setUserMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleSignOut = () => {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "user_id=; path=/; max-age=0";
    setLoggedIn(false);
    setUserMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo Section - Formal & Structured */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-zinc-900 dark:bg-zinc-100">
            <span className="text-[9px] font-black text-white dark:text-black">
              JP
            </span>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            JobPilot{" "}
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 ml-1">
              Enterprise
            </span>
          </span>
        </div>

        {/* Desktop Navigation - Sans Serif & Professional */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "How It Works", "Safety"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Auth Actions - Industrial/Formal Style */}
        <div className="hidden items-center gap-4 md:flex">
          {loggedIn === true && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((s) => !s)}
                className="flex cursor-pointer rounded-full h-10 w-10 items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-2 transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
              >
                <div className="flex p-2 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <User
                    size={18}
                    className=" text-zinc-600 dark:text-zinc-400"
                  />
                </div>
              </button>

              {/* Dropdown - Clean & Minimal */}
              <div
                className={`absolute right-0 mt-1.5 w-auto origin-top-right rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl transition-all ${
                  userMenuOpen
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0 pointer-events-none"
                }`}
              >
                <div className="border-b pr-5  border-zinc-100 dark:border-zinc-900 px-4 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Authenticated
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-[12px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            </div>
          )}

          {loggedIn === false && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="h-8 px-4 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
              <Button
                className="h-8 rounded-sm bg-zinc-900 dark:bg-zinc-100 px-4 text-[12px] font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                onClick={() => router.push("/login")}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="p-1 md:hidden text-zinc-900 dark:text-zinc-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-5">
            {["Features", "How It Works", "Safety"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-semibold text-zinc-600 dark:text-zinc-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="mt-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <Button className="w-full text-zinc-300 dark:text-zinc-800 rounded-sm h-11 bg-zinc-900 dark:bg-zinc-100 text-[13px] font-bold">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
