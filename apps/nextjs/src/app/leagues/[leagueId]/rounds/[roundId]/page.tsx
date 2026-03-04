import { AppShell } from "~/components/app-shell";

export default function RoundDetailPage() {
  return (
    <AppShell>
      <div className="py-4">
        <h1 className="mb-6 text-2xl font-bold">Round Detail</h1>
        <div className="glass-card rounded-xl p-5">
          <p className="text-muted-foreground">
            Submissions, voting, and results coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
