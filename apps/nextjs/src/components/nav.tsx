"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Music, Settings, Trophy, User, X } from "lucide-react";

import { Button } from "@acme/ui/button";

import { authClient } from "~/auth/client";

const navLinks = [
  { href: "/", label: "Leagues", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Nav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative z-20">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Music className="h-6 w-6 text-emerald-400" />
          <span className="text-glow text-xl font-bold tracking-tight">
            Chumba<span className="text-emerald-400">League</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {session &&
            navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

          {session ? (
            <form
              action={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
            >
              <Button variant="ghost" size="sm" className="ml-2">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 transition-colors hover:bg-white/10 sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="glass-panel mx-4 mb-4 rounded-xl p-3 sm:hidden">
          {session &&
            navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

          {session ? (
            <button
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
              className="text-muted-foreground hover:text-foreground mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
