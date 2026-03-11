import { relations, sql } from "drizzle-orm";
import { index, pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

// Music League Enums

export const leagueStatusEnum = pgEnum("league_status", [
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);

export const roundStatusEnum = pgEnum("round_status", [
  "PENDING",
  "SUBMISSION",
  "VOTING",
  "RESULTS",
  "COMPLETED",
]);

export const deadlineBehaviorEnum = pgEnum("deadline_behavior", [
  "STEADY",
  "ACCELERATED",
  "SPEEDY",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "REVIEWED",
  "DISMISSED",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "SPAM",
  "OFFENSIVE",
  "HARASSMENT",
  "OTHER",
]);

export const contentTypeEnum = pgEnum("content_type", [
  "LEAGUE",
  "SUBMISSION",
  "USER",
  "COMMENT",
  "ROUND",
]);

// ─── Core Music League Tables ───────────────────────────────────────────────

export const League = pgTable(
  "league",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: t.text().notNull(),
    description: t.text(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
    status: leagueStatusEnum("status").default("ACTIVE").notNull(),
    inviteCode: t.text("invite_code").notNull().unique(),

    // Settings
    songsPerRound: t.integer("songs_per_round").default(1).notNull(),
    maxMembers: t.integer("max_members").default(20).notNull(),
    allowDownvotes: t.boolean("allow_downvotes").default(false).notNull(),
    downvotePointValue: t.integer("downvote_point_value").default(-1).notNull(),
    upvotePointsPerRound: t
      .integer("upvote_points_per_round")
      .default(5)
      .notNull(),
    submissionWindowDays: t
      .integer("submission_window_days")
      .default(3)
      .notNull(),
    votingWindowDays: t.integer("voting_window_days").default(2).notNull(),
    downvotePointsPerRound: t
      .integer("downvote_points_per_round")
      .default(3)
      .notNull(),
    isPublic: t.boolean("is_public").default(false).notNull(),
    deadlineBehavior: deadlineBehaviorEnum("deadline_behavior")
      .default("STEADY")
      .notNull(),
    maxUpvotesPerSong: t.integer("max_upvotes_per_song"),
    maxDownvotesPerSong: t.integer("max_downvotes_per_song"),
    votingPenalty: t.boolean("voting_penalty").default(false).notNull(),

    // Relations
    creatorId: t
      .text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("league_creator_id_idx").on(table.creatorId),
    index("league_invite_code_idx").on(table.inviteCode),
  ],
);

export const LeagueMember = pgTable(
  "league_member",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    joinedAt: t
      .timestamp("joined_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    role: memberRoleEnum("role").default("MEMBER").notNull(),

    leagueId: t
      .text("league_id")
      .notNull()
      .references(() => League.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("league_member_user_id_idx").on(table.userId),
    index("league_member_league_user_unique").on(table.leagueId, table.userId),
  ],
);

export const Round = pgTable(
  "round",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roundNumber: t.integer("round_number").notNull(),
    sortOrder: t.integer("sort_order").default(0).notNull(),
    themeName: t.text("theme_name").notNull(),
    themeDescription: t.text("theme_description"),
    status: roundStatusEnum("status").default("SUBMISSION").notNull(),
    startDate: t
      .timestamp("start_date", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
    submissionDeadline: t
      .timestamp("submission_deadline", { withTimezone: true, mode: "date" })
      .notNull(),
    votingDeadline: t
      .timestamp("voting_deadline", { withTimezone: true, mode: "date" })
      .notNull(),
    playlistUrl: t.text("playlist_url"),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),

    leagueId: t
      .text("league_id")
      .notNull()
      .references(() => League.id, { onDelete: "cascade" }),
  }),
  (table) => [index("round_league_id_idx").on(table.leagueId)],
);

export const Submission = pgTable(
  "submission",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    spotifyTrackId: t.text("spotify_track_id").notNull(),
    trackName: t.text("track_name").notNull(),
    artistName: t.text("artist_name").notNull(),
    albumName: t.text("album_name").notNull(),
    albumArtUrl: t.text("album_art_url").notNull(),
    previewUrl: t.text("preview_url"),
    trackDurationMs: t.integer("track_duration_ms").notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),

    roundId: t
      .text("round_id")
      .notNull()
      .references(() => Round.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("submission_round_id_idx").on(table.roundId),
    index("submission_user_id_idx").on(table.userId),
    index("submission_round_user_track_unique").on(
      table.roundId,
      table.userId,
      table.spotifyTrackId,
    ),
  ],
);

export const Vote = pgTable(
  "vote",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    points: t.integer("points").notNull(),

    roundId: t
      .text("round_id")
      .notNull()
      .references(() => Round.id, { onDelete: "cascade" }),
    voterId: t
      .text("voter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    submissionId: t
      .text("submission_id")
      .notNull()
      .references(() => Submission.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("vote_submission_id_idx").on(table.submissionId),
    index("vote_voter_id_idx").on(table.voterId),
    index("vote_round_voter_submission_unique").on(
      table.roundId,
      table.voterId,
      table.submissionId,
    ),
  ],
);

export const Comment = pgTable(
  "comment",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    text: t.text("text").notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),

    submissionId: t
      .text("submission_id")
      .notNull()
      .references(() => Submission.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("comment_submission_id_idx").on(table.submissionId),
    index("comment_user_id_idx").on(table.userId),
    index("comment_submission_user_unique").on(
      table.submissionId,
      table.userId,
    ),
  ],
);

// ─── Moderation Tables ──────────────────────────────────────────────────────

export const Report = pgTable(
  "report",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reporterId: t
      .text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reportedUserId: t
      .text("reported_user_id")
      .references(() => user.id, { onDelete: "set null" }),
    contentType: contentTypeEnum("content_type").notNull(),
    contentId: t.text("content_id").notNull(),
    reason: reportReasonEnum("reason").notNull(),
    details: t.text("details"),
    status: reportStatusEnum("status").default("PENDING").notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (table) => [
    index("report_reporter_id_idx").on(table.reporterId),
    index("report_reported_user_id_idx").on(table.reportedUserId),
    index("report_content_type_id_idx").on(table.contentType, table.contentId),
    index("report_status_idx").on(table.status),
  ],
);

export const BlockedUser = pgTable(
  "blocked_user",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blockedUserId: t
      .text("blocked_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (table) => [
    uniqueIndex("blocked_user_unique").on(table.userId, table.blockedUserId),
    index("blocked_user_user_id_idx").on(table.userId),
    index("blocked_user_blocked_user_id_idx").on(table.blockedUserId),
  ],
);

export const ContentFlag = pgTable(
  "content_flag",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    contentType: contentTypeEnum("content_type").notNull(),
    contentId: t.text("content_id").notNull(),
    flaggedText: t.text("flagged_text").notNull(),
    matchedWords: t.text("matched_words").array().notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (table) => [
    index("content_flag_content_type_id_idx").on(
      table.contentType,
      table.contentId,
    ),
  ],
);

// ─── Supporting Tables ──────────────────────────────────────────────────────

export const PushToken = pgTable(
  "push_token",
  (t) => ({
    id: t
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: t.text().notNull(),
    platform: t.text().notNull(), // 'ios' | 'android'
    createdAt: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (table) => [
    index("push_token_user_id_idx").on(table.userId),
    index("push_token_token_unique").on(table.token),
  ],
);

export const ThemeTemplate = pgTable("theme_template", (t) => ({
  id: t
    .text()
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: t.text("name").notNull(),
  description: t.text("description").notNull(),
  category: t.text("category").notNull(),
}));

// ─── Relations ──────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  leagues: many(League),
  leagueMemberships: many(LeagueMember),
  submissions: many(Submission),
  votes: many(Vote),
  comments: many(Comment),
}));

export const leagueRelations = relations(League, ({ one, many }) => ({
  creator: one(user, {
    fields: [League.creatorId],
    references: [user.id],
  }),
  members: many(LeagueMember),
  rounds: many(Round),
}));

export const leagueMemberRelations = relations(LeagueMember, ({ one }) => ({
  league: one(League, {
    fields: [LeagueMember.leagueId],
    references: [League.id],
  }),
  user: one(user, {
    fields: [LeagueMember.userId],
    references: [user.id],
  }),
}));

export const roundRelations = relations(Round, ({ one, many }) => ({
  league: one(League, {
    fields: [Round.leagueId],
    references: [League.id],
  }),
  submissions: many(Submission),
}));

export const submissionRelations = relations(Submission, ({ one, many }) => ({
  round: one(Round, {
    fields: [Submission.roundId],
    references: [Round.id],
  }),
  user: one(user, {
    fields: [Submission.userId],
    references: [user.id],
  }),
  votes: many(Vote),
  comments: many(Comment),
}));

export const voteRelations = relations(Vote, ({ one }) => ({
  round: one(Round, {
    fields: [Vote.roundId],
    references: [Round.id],
  }),
  voter: one(user, {
    fields: [Vote.voterId],
    references: [user.id],
  }),
  submission: one(Submission, {
    fields: [Vote.submissionId],
    references: [Submission.id],
  }),
}));

export const commentRelations = relations(Comment, ({ one }) => ({
  submission: one(Submission, {
    fields: [Comment.submissionId],
    references: [Submission.id],
  }),
  user: one(user, {
    fields: [Comment.userId],
    references: [user.id],
  }),
}));

export const reportRelations = relations(Report, ({ one }) => ({
  reporter: one(user, {
    fields: [Report.reporterId],
    references: [user.id],
    relationName: "reportReporter",
  }),
  reportedUser: one(user, {
    fields: [Report.reportedUserId],
    references: [user.id],
    relationName: "reportReportedUser",
  }),
}));

export const blockedUserRelations = relations(BlockedUser, ({ one }) => ({
  user: one(user, {
    fields: [BlockedUser.userId],
    references: [user.id],
    relationName: "blockerUser",
  }),
  blockedUser: one(user, {
    fields: [BlockedUser.blockedUserId],
    references: [user.id],
    relationName: "blockedUserTarget",
  }),
}));

export const pushTokenRelations = relations(PushToken, ({ one }) => ({
  user: one(user, {
    fields: [PushToken.userId],
    references: [user.id],
  }),
}));

export * from "./auth-schema";
