"use client";

import { useRef, useState } from "react";
import { BookOpen, GripVertical, Plus, Sparkles, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

// ─── Theme Templates ────────────────────────────────────────────────────────

const THEME_TEMPLATES = [
  {
    name: "Guilty Pleasures",
    description: "Songs you love but are embarrassed to admit",
    category: "Classic",
  },
  {
    name: "One-Hit Wonders",
    description: "Artists known for just one big hit",
    category: "Classic",
  },
  {
    name: "Covers",
    description: "Cover versions of songs",
    category: "Classic",
  },
  {
    name: "Duets",
    description: "Songs featuring two or more artists",
    category: "Classic",
  },
  {
    name: "Jazz",
    description: "Jazz tracks of any era",
    category: "Genre",
  },
  {
    name: "Hip-Hop",
    description: "Hip-hop and rap tracks",
    category: "Genre",
  },
  {
    name: "Country",
    description: "Country music",
    category: "Genre",
  },
  {
    name: "Electronic",
    description: "Electronic, EDM, or synth-based music",
    category: "Genre",
  },
  {
    name: "Punk",
    description: "Punk rock and its subgenres",
    category: "Genre",
  },
  {
    name: "Songs from the 80s",
    description: "Released between 1980-1989",
    category: "Era",
  },
  {
    name: "Songs from the 2000s",
    description: "Released between 2000-2009",
    category: "Era",
  },
  {
    name: "Songs from the Year You Were Born",
    description: "Released the year you were born",
    category: "Era",
  },
  {
    name: "Songs That Make You Cry",
    description: "Emotionally devastating tracks",
    category: "Mood",
  },
  {
    name: "Road Trip Anthems",
    description: "Perfect for driving with the windows down",
    category: "Mood",
  },
  {
    name: "Late Night Vibes",
    description: "Music for the late hours",
    category: "Mood",
  },
  {
    name: "Workout Bangers",
    description: "High energy tracks to get you moving",
    category: "Mood",
  },
  {
    name: "Songs Under 3 Minutes",
    description: "Short and sweet - under 3 minutes",
    category: "Challenge",
  },
  {
    name: "Songs with a Color in the Title",
    description: "The title must contain a color",
    category: "Challenge",
  },
  {
    name: "One-Word Song Titles",
    description: "The title is a single word",
    category: "Challenge",
  },
  {
    name: "Instrumentals Only",
    description: "No vocals allowed",
    category: "Challenge",
  },
  {
    name: "Foreign Language Songs",
    description: "Sung in a language other than English",
    category: "Challenge",
  },
  {
    name: "Your Most Played Song",
    description: "Your current most-listened track",
    category: "Personal",
  },
  {
    name: "A Song That Changed Your Life",
    description: "A track that had a profound impact on you",
    category: "Personal",
  },
  {
    name: "Your Guilty Pleasure",
    description: "The song you secretly love",
    category: "Personal",
  },
  {
    name: "A Song That Reminds You of Someone",
    description: "A track tied to a specific person",
    category: "Personal",
  },
];

const CATEGORIES = [
  "Classic",
  "Genre",
  "Era",
  "Mood",
  "Challenge",
  "Personal",
] as const;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RoundDraft {
  id: string;
  themeName: string;
  themeDescription: string;
}

// ─── Theme Browser Dialog ───────────────────────────────────────────────────

function ThemeBrowserDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string, description: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("Classic");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Browse Theme Templates
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
          {THEME_TEMPLATES.filter((t) => t.category === activeCategory).map(
            (theme) => (
              <button
                key={theme.name}
                type="button"
                className="hover:bg-accent border-border/50 w-full rounded-lg border p-3 text-left transition-colors"
                onClick={() => {
                  onSelect(theme.name, theme.description);
                  onOpenChange(false);
                }}
              >
                <p className="text-sm font-medium">{theme.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {theme.description}
                </p>
              </button>
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Round Input Form ───────────────────────────────────────────────────────

export function RoundInputForm({
  themeName,
  setThemeName,
  themeDescription,
  setThemeDescription,
  onAdd,
  addLabel = "Add Round",
}: {
  themeName: string;
  setThemeName: (v: string) => void;
  themeDescription: string;
  setThemeDescription: (v: string) => void;
  onAdd: () => void;
  addLabel?: string;
}) {
  const [showBrowser, setShowBrowser] = useState(false);

  const handleSelectTheme = (name: string, description: string) => {
    setThemeName(name);
    setThemeDescription(description);
  };

  return (
    <>
      <div className="border-border/50 space-y-3 rounded-lg border border-dashed p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="round-name">Theme Name</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto px-2 py-1 text-xs"
              onClick={() => setShowBrowser(true)}
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Browse Themes
            </Button>
          </div>
          <Input
            id="round-name"
            placeholder="e.g. Songs that make you feel like a spy"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="round-desc">
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="round-desc"
            placeholder="Any extra context for the theme"
            value={themeDescription}
            onChange={(e) => setThemeDescription(e.target.value)}
            maxLength={500}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAdd}
          disabled={!themeName.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>

      <ThemeBrowserDialog
        open={showBrowser}
        onOpenChange={setShowBrowser}
        onSelect={handleSelectTheme}
      />
    </>
  );
}

// ─── Round List with Drag-to-Reorder ────────────────────────────────────────

export function RoundList({
  rounds,
  onRemove,
  onReorder,
  numberOffset = 0,
}: {
  rounds: RoundDraft[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  numberOffset?: number;
}) {
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    const from = dragIdx.current;
    const to = dragOverIdx;
    dragIdx.current = null;
    setDragOverIdx(null);

    if (from === null || to === null || from === to) return;
    onReorder(from, to);
  };

  if (rounds.length === 0) return null;

  return (
    <div className="space-y-2">
      {rounds.map((round, idx) => (
        <div
          key={round.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`border-border/50 flex items-center gap-3 rounded-lg border p-3 transition-colors ${
            dragOverIdx === idx
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "hover:bg-muted/50"
          }`}
        >
          <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              <span className="text-muted-foreground">
                {numberOffset + idx + 1}.{" "}
              </span>
              {round.themeName}
            </p>
            {round.themeDescription && (
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {round.themeDescription}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0 p-0"
            onClick={() => onRemove(round.id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Combined Round Editor ──────────────────────────────────────────────────

export function RoundEditor({
  rounds,
  setRounds,
  description,
}: {
  rounds: RoundDraft[];
  setRounds: React.Dispatch<React.SetStateAction<RoundDraft[]>>;
  description?: string;
}) {
  const nextId = useRef(0);
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundDescription, setNewRoundDescription] = useState("");

  const addRound = () => {
    if (!newRoundName.trim()) return;
    setRounds((prev) => [
      ...prev,
      {
        id: String(nextId.current++),
        themeName: newRoundName.trim(),
        themeDescription: newRoundDescription.trim(),
      },
    ]);
    setNewRoundName("");
    setNewRoundDescription("");
  };

  const removeRound = (id: string) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReorder = (from: number, to: number) => {
    setRounds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}

      <RoundList
        rounds={rounds}
        onRemove={removeRound}
        onReorder={handleReorder}
      />

      <RoundInputForm
        themeName={newRoundName}
        setThemeName={setNewRoundName}
        themeDescription={newRoundDescription}
        setThemeDescription={setNewRoundDescription}
        onAdd={addRound}
      />
    </div>
  );
}
