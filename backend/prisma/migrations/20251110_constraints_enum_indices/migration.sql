-- Migration: constraints, enum and indexes for reservations and rooms
-- Date: 2025-11-10

-- 1) Enum for reservation status (idempotent creation)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('pending','approved','rejected','cancelled');
  END IF;
END $$;

-- 2) Convert Reservation.status to enum if it's text/varchar
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Reservation' AND column_name = 'status'
  ) THEN
    BEGIN
      ALTER TABLE "Reservation"
        ALTER COLUMN "status" TYPE reservation_status USING "status"::reservation_status;
    EXCEPTION WHEN invalid_text_representation THEN
      -- fallback: coerce invalid values to 'pending' before conversion
      UPDATE "Reservation" SET "status" = 'pending'::text WHERE "status" NOT IN ('pending','approved','rejected','cancelled');
      ALTER TABLE "Reservation"
        ALTER COLUMN "status" TYPE reservation_status USING "status"::reservation_status;
    END;
  END IF;
END $$;

-- 3) CHECK constraints (idempotent via names)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservation_interval_chk'
  ) THEN
    ALTER TABLE "Reservation"
      ADD CONSTRAINT reservation_interval_chk CHECK ("endTime" > "startTime");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'room_capacity_chk'
  ) THEN
    ALTER TABLE "Room"
      ADD CONSTRAINT room_capacity_chk CHECK ("capacity" > 0);
  END IF;
END $$;

-- 4) Indexes (IF NOT EXISTS not supported for all versions; guard with catalog checks)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'reservation_room_start_idx' AND n.nspname = current_schema()
  ) THEN
    CREATE INDEX reservation_room_start_idx ON "Reservation"("roomId", "startTime");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'reservation_user_start_idx' AND n.nspname = current_schema()
  ) THEN
    CREATE INDEX reservation_user_start_idx ON "Reservation"("userId", "startTime");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'reservation_status_idx' AND n.nspname = current_schema()
  ) THEN
    CREATE INDEX reservation_status_idx ON "Reservation"("status");
  END IF;
END $$;
