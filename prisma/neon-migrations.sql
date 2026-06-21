-- ─────────────────────────────────────────────────────────────────────────
-- Koumian Academy — consolidated manual migrations for Neon (Postgres).
--
-- Safe to run repeatedly: every statement uses IF NOT EXISTS, so re-running
-- it never errors and never touches data that already exists. Paste the whole
-- file into the Neon SQL Editor and run it once.
--
-- The app is written to DEGRADE GRACEFULLY when these are missing (comments,
-- notifications, bios, post images, and reactions all have fallbacks), so the
-- site never crashes — but running this unlocks their full functionality.
-- ─────────────────────────────────────────────────────────────────────────

-- 0) Course cover image + intro/trailer video  ← fixes "can't save course"
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "trailerUrl"    TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "trailerType"   TEXT;

-- 0b) Rich lesson editor fields (JSON-encoded as TEXT)
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "sections"              TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "takeaways"             TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "proTip"                TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "videoDuration"         TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "videoType"             TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "assignmentEnabled"     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "assignmentTitle"       TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "assignmentDescription" TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "assignmentFileTypes"   TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "published"             BOOLEAN NOT NULL DEFAULT true;

-- 1) Profile bio (self-service profile)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- 2) Image attachments on feed / big-win posts
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- 3) Emoji reactions on posts (like | love | fire | clap | insight)
ALTER TABLE "PostLike"
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'like';

-- 4) Comments on posts
CREATE TABLE IF NOT EXISTS "Comment" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "postId"    TEXT NOT NULL,
  "authorId"  TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx"
  ON "Comment" ("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "Comment_authorId_idx"
  ON "Comment" ("authorId");

-- 5) In-app notifications
CREATE TABLE IF NOT EXISTS "Notification" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "body"      TEXT,
  "link"      TEXT,
  "read"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Notification_userId_read_createdAt_idx"
  ON "Notification" ("userId", "read", "createdAt");
