import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { auth, getSession } from "~/auth/server";
import { AppShell } from "~/components/app-shell";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="glass-panel mx-auto max-w-md rounded-3xl p-10 text-center">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden rounded-3xl">
            <div className="bg-primary/10 absolute top-[-50%] left-[-20%] h-[80%] w-[80%] rounded-full mix-blend-screen blur-[100px]" />
            <div className="absolute right-[-10%] bottom-[-20%] h-[60%] w-[60%] rounded-full bg-emerald-600/10 mix-blend-screen blur-[80px]" />
          </div>

          <div className="relative z-10">
            <h1 className="text-glow mb-2 text-4xl font-extrabold tracking-tight">
              Chumba<span className="text-emerald-400">League</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Music leagues with friends. Submit songs, vote, compete.
            </p>

            <form>
              <Button
                size="lg"
                className="w-full"
                formAction={async () => {
                  "use server";
                  const res = await auth.api.signInSocial({
                    body: {
                      provider: "discord",
                      callbackURL: "/",
                    },
                  });
                  if (!res.url) {
                    throw new Error("No URL returned from signInSocial");
                  }
                  redirect(res.url);
                }}
              >
                Sign in with Discord
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="py-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Your Leagues</h1>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-muted-foreground font-medium">
              Welcome, {session.user.name}!
            </p>
            <p className="text-muted-foreground text-sm">
              Your leagues will appear here. Create one or join with an invite
              code.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
