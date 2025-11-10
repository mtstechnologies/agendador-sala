-- DDL consolidado para ambientes sem Prisma Migrate
-- Data: 2025-11-10

-- 1) Enum de status (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('pending','approved','rejected','cancelled');
  END IF;
END $$;

-- 2) Conversão de coluna status para enum
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Reservation' AND column_name = 'status'
  ) THEN
    BEGIN
      ALTER TABLE "Reservation"
        ALTER COLUMN "status" TYPE reservation_status USING "status"::reservation_status;
    EXCEPTION WHEN invalid_text_representation THEN
      UPDATE "Reservation" SET "status" = 'pending'::text WHERE "status" NOT IN ('pending','approved','rejected','cancelled');
      ALTER TABLE "Reservation"
        ALTER COLUMN "status" TYPE reservation_status USING "status"::reservation_status;
    END;
  END IF;
END $$;

-- 3) Constraints de integridade
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservation_interval_chk') THEN
    ALTER TABLE "Reservation" ADD CONSTRAINT reservation_interval_chk CHECK ("endTime" > "startTime");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_capacity_chk') THEN
    ALTER TABLE "Room" ADD CONSTRAINT room_capacity_chk CHECK ("capacity" > 0);
  END IF;
END $$;

-- 4) Índices recomendados
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reservation_room_start_idx') THEN
    CREATE INDEX reservation_room_start_idx ON "Reservation"("roomId", "startTime");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reservation_user_start_idx') THEN
    CREATE INDEX reservation_user_start_idx ON "Reservation"("userId", "startTime");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reservation_status_idx') THEN
    CREATE INDEX reservation_status_idx ON "Reservation"("status");
  END IF;
END $$;
