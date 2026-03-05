"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Home } from "lucide-react";

import { useTRPC } from "~/trpc/react";

function useBreadcrumbs() {
  const pathname = usePathname();
  const trpc = useTRPC();
  const params = useParams<{
    leagueId?: string;
    roundId?: string;
    inviteCode?: string;
  }>();

  const { data: league } = useQuery(
    trpc.musicLeague.getLeagueById.queryOptions(
      { id: params.leagueId ?? "" },
      { enabled: !!params.leagueId },
    ),
  );

  const { data: round } = useQuery(
    trpc.musicLeague.getRoundById.queryOptions(
      { roundId: params.roundId ?? "" },
      { enabled: !!params.roundId },
    ),
  );

  const crumbs: { label: string; href: string }[] = [
    { label: "Leagues", href: "/" },
  ];

  if (pathname === "/leagues/create") {
    return [
      { label: "Leagues", href: "/" },
      { label: "Create League", href: pathname },
    ];
  }

  if (pathname.startsWith("/join/") && params.inviteCode) {
    return [
      { label: "Leagues", href: "/" },
      { label: "Join League", href: pathname },
    ];
  }

  if (params.leagueId) {
    crumbs.push({
      label: league?.name ?? "League",
      href: `/leagues/${params.leagueId}`,
    });
  }

  if (params.leagueId && pathname.includes("/rounds/create")) {
    crumbs.push({
      label: "New Round",
      href: pathname,
    });
  } else if (params.leagueId && params.roundId) {
    const isPlaylist = pathname.endsWith("/playlist");
    const roundLabel = round
      ? `Round ${round.roundNumber}: ${round.themeName}`
      : "Round";
    crumbs.push({
      label: roundLabel,
      href: `/leagues/${params.leagueId}/rounds/${params.roundId}`,
    });
    if (isPlaylist) {
      crumbs.push({
        label: "Playlist",
        href: pathname,
      });
    }
  }

  return crumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = useBreadcrumbs();

  // Don't show breadcrumbs on home, profile, or settings
  if (pathname === "/" || pathname === "/profile" || pathname === "/settings")
    return null;

  return (
    <div className="border-border/40 mb-4 border-b border-dashed pb-3">
      <nav
        className="flex items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <div key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="text-muted-foreground/50 h-3.5 w-3.5" />
              {isLast ? (
                <span className="text-foreground max-w-[200px] truncate font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground max-w-[200px] truncate transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
