import { AppShell } from "~/components/app-shell";

export default function JoinLeaguePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  return (
    <AppShell>
      <div className="py-4">
        <h1 className="mb-6 text-2xl font-bold">Join League</h1>
        <div className="glass-card rounded-xl p-5">
          <p className="text-muted-foreground">
            Join league confirmation coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
