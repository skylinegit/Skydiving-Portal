-- =============================================================================
-- Seed: one test user for local development.
--
-- This file is a REFERENCE for the columns required. It does NOT contain a
-- usable password hash because bcrypt hashes are random-salted at generation
-- time and cannot be precomputed.
--
-- Recommended way to create the test user:
--   poetry run python -m scripts.create_test_user
--
-- Or, if you want to use this SQL directly, generate a hash first:
--   poetry run python -c "from src.auth.password import hash_password; print(hash_password('Skydive2025!'))"
-- then paste the printed value into the password_hash column below and run
-- this file with psql.
-- =============================================================================

INSERT INTO users (
  email,
  password_hash,
  hash_algorithm,
  first_name,
  last_name,
  dob,
  gender,
  phone_number,
  address_1,
  town,
  county,
  postcode,
  height_cm,
  weight_kg,
  terms_agreed_at
)
VALUES (
  'test@skylineevents.co.uk',
  '<<PASTE_BCRYPT_HASH_HERE>>',  -- generate via the Python one-liner above
  'bcrypt',
  'Test',
  'Jumper',
  '1995-03-14',
  'male',
  '07700 900000',
  '1 Sample Lane',
  'Maidstone',
  'Kent',
  'ME17 1SP',
  183.00,
  78.00,
  NOW()
)
ON CONFLICT (email) DO NOTHING;
