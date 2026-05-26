-- =============================================================================
-- Rollback for migration 0001_initial_schema
-- Drops every object created by the forward migration in reverse FK order.
-- Destructive — only run if you need to fully reset the portal schema.
-- =============================================================================

BEGIN;

-- Drop child tables before parents (FK order)
DROP TABLE IF EXISTS email_change_confirmations;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS correspondence;
DROP TABLE IF EXISTS sponsorship_collected;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS charity_codes;
DROP TABLE IF EXISTS charities;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS users;

DROP FUNCTION IF EXISTS set_updated_at();

COMMIT;
