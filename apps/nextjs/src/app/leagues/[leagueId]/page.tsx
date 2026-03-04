import { AppShell } from "~/components/app-shell";

export default function LeagueDetailPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  return (
    <AppShell>
      <div className="py-4">
        <h1 className="mb-6 text-2xl font-bold">League Detail</h1>
        <div className="glass-card rounded-xl p-5">
          <p className="text-muted-foreground">
            League details, rounds, and members coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
