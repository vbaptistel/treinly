-- Enable btree_gist extension for EXCLUDE constraint support
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent overlapping BOOKED appointments per tenant (uses busy range with buffers)
ALTER TABLE "treinly"."appointments"
  ADD CONSTRAINT "appointments_no_overlap"
  EXCLUDE USING gist (
    "tenant_id" WITH =,
    tstzrange("busy_start_at", "busy_end_at", '[)') WITH &&
  )
  WHERE ("status" = 'BOOKED');
