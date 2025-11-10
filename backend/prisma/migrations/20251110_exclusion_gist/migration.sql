-- Add exclusion constraint to prevent overlapping reservations per room
-- Date: 2025-11-10

-- Requirements: btree_gist for uuid equality in GiST and tsrange support
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add generated column for tsrange if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Reservation' AND column_name = 'ts_range'
  ) THEN
    ALTER TABLE "Reservation"
      ADD COLUMN ts_range tsrange GENERATED ALWAYS AS (tsrange("startTime", "endTime", '[)')) STORED;
  END IF;
END $$;

-- Add exclusion constraint to avoid overlaps for pending/approved
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservation_no_overlap'
  ) THEN
    ALTER TABLE "Reservation"
      ADD CONSTRAINT reservation_no_overlap
      EXCLUDE USING gist ("roomId" WITH =, ts_range WITH &&)
      WHERE ("status" IN ('pending','approved'));
  END IF;
END $$;

-- Functional index for monthly grouping (reports)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'reservation_month_idx'
  ) THEN
    CREATE INDEX reservation_month_idx ON "Reservation" (date_trunc('month', "startTime"));
  END IF;
END $$;
