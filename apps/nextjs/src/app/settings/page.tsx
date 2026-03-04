"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";

import { authClient } from "~/auth/client";
import { AppShell } from "~/components/app-shell";
import { useTRPC } from "~/trpc/react";

interface NotificationPrefs {
  roundStart: boolean;
  submissionReminder: boolean;
  votingOpen: boolean;
  resultsAvailable: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  roundStart: true,
  submissionReminder: true,
  votingOpen: true,
  resultsAvailable: true,
};

const PREF_LABELS: Record<keyof NotificationPrefs, string> = {
  roundStart: "Round Started",
  submissionReminder: "Submission Reminder",
  votingOpen: "Voting Open",
  resultsAvailable: "Results Available",
};

const PREF_DESCRIPTIONS: Record<keyof NotificationPrefs, string> = {
  roundStart: "Get notified when a new round begins",
  submissionReminder: "Reminder before submission deadline",
  votingOpen: "Get notified when voting opens",
  resultsAvailable: "Get notified when round results are in",
};

function NotificationForm({
  initialPrefs,
}: {
  initialPrefs: NotificationPrefs;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);
  const [dirty, setDirty] = useState(false);

  const updatePrefs = useMutation(
    trpc.musicLeague.updateNotificationPreferences.mutationOptions({
      onSuccess: () => {
        setDirty(false);
        void queryClient.invalidateQueries(
          trpc.musicLeague.getUserProfile.queryFilter(),
        );
      },
    }),
  );

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  };

  return (
    <Card className="glass-card border-white/5">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {(Object.keys(PREF_LABELS) as (keyof NotificationPrefs)[]).map(
          (key) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Label className="text-sm font-medium">
                  {PREF_LABELS[key]}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {PREF_DESCRIPTIONS[key]}
                </p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ),
        )}

        <Button
          onClick={() => updatePrefs.mutate(prefs)}
          disabled={!dirty || updatePrefs.isPending}
          className="w-full"
        >
          {updatePrefs.isPending ? "Saving..." : "Save Preferences"}
        </Button>

        {updatePrefs.isSuccess && !dirty && (
          <p className="text-primary text-center text-sm">Preferences saved</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();

  const { data: profile, isLoading } = useQuery(
    trpc.musicLeague.getUserProfile.queryOptions(),
  );

  return (
    <AppShell>
      <div className="py-4">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account info */}
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="text-sm">{session?.user?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Auth Provider</p>
                  <p className="text-sm">Discord</p>
                </div>
              </CardContent>
            </Card>

            {/* Notification preferences */}
            <NotificationForm
              initialPrefs={
                profile?.notificationPreferences ?? DEFAULT_PREFS
              }
            />

            {/* Sign out */}
            <form
              action={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
            >
              <Button variant="outline" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
