-- ============================================================
-- DAKKHO — Piprapay Payment Integration Migration (v2)
-- Only adds columns that don't already exist
-- ============================================================

-- ─── PAYMENTS TABLE: Add missing columns only ───
-- Existing: id, user_id, package_id, course_id, amount, currency, gateway, gateway_trx_id, gateway_payment_id, status, proof_url, trx_id_submitted, phone_submitted, verified_by, verified_at, metadata, created_at, updated_at, pp_id, fee, total, paid_at, discount_applied, coupon_applied, coupon_code
-- Missing: order_id, pp_url, webhook_data, customer_name, customer_email, customer_phone

ALTER TABLE payments ADD COLUMN order_id TEXT;
ALTER TABLE payments ADD COLUMN pp_url TEXT;
ALTER TABLE payments ADD COLUMN webhook_data TEXT;
ALTER TABLE payments ADD COLUMN customer_name TEXT;
ALTER TABLE payments ADD COLUMN customer_email TEXT;
ALTER TABLE payments ADD COLUMN customer_phone TEXT;

-- ─── ENROLLMENTS TABLE: Add missing columns only ───
-- Existing: id, user_id, course_id, status, progress, completed, enrolled_via, pp_id, enrolled_at, created_at, updated_at
-- Missing: package_id, payment_id, expires_at

ALTER TABLE enrollments ADD COLUMN package_id INTEGER;
ALTER TABLE enrollments ADD COLUMN payment_id INTEGER REFERENCES payments(id);
ALTER TABLE enrollments ADD COLUMN expires_at TEXT;

-- ─── INDEXES for new columns ───
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_course_status ON payments(user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course_status ON enrollments(user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_expires ON enrollments(expires_at);

-- ─── SEED: Add Piprapay to payment_config ───
INSERT OR IGNORE INTO payment_config (gateway, is_active, config, sandbox_mode, instructions, instructions_bn) VALUES
  ('piprapay', 1, '{"baseUrl":"https://pay.dakkho.pro.bd/api"}', 0, 'Pay securely via bKash, Nagad, or Card through our payment partner.', 'bKash, Nagad বা Card এর মাধ্যমে নিরাপদে পেমেন্ট করুন।');
