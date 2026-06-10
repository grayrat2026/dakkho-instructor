-- ============================================================
-- DAKKHO — Piprapay Payment Integration Migration
-- Adds: order_id, Piprapay fields, webhook_data to payments
-- Adds: package_id, payment_id, expires_at, status to enrollments
-- ============================================================

-- ─── PAYMENTS TABLE: Add new columns ───
ALTER TABLE payments ADD COLUMN order_id TEXT;
ALTER TABLE payments ADD COLUMN pp_id TEXT;
ALTER TABLE payments ADD COLUMN pp_url TEXT;
ALTER TABLE payments ADD COLUMN webhook_data TEXT;
ALTER TABLE payments ADD COLUMN customer_name TEXT;
ALTER TABLE payments ADD COLUMN customer_email TEXT;
ALTER TABLE payments ADD COLUMN customer_phone TEXT;

-- ─── ENROLLMENTS TABLE: Add new columns ───
ALTER TABLE enrollments ADD COLUMN package_id INTEGER;
ALTER TABLE enrollments ADD COLUMN payment_id INTEGER REFERENCES payments(id);
ALTER TABLE enrollments ADD COLUMN expires_at TEXT;
ALTER TABLE enrollments ADD COLUMN status TEXT DEFAULT 'active';

-- ─── INDEXES for new columns ───
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_course_status ON payments(user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course_status ON enrollments(user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_expires ON enrollments(expires_at);

-- ─── SEED: Add Piprapay to payment_config ───
INSERT OR IGNORE INTO payment_config (gateway, is_active, config, sandbox_mode, instructions, instructions_bn) VALUES
  ('piprapay', 1, '{"baseUrl":"https://pay.dakkho.pro.bd/api"}', 0, 'Pay securely via bKash, Nagad, or Card through our payment partner.', 'bKash, Nagad বা Card এর মাধ্যমে নিরাপদে পেমেন্ট করুন।');
