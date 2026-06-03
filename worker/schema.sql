-- DAKKHO Admin API - D1 Database Schema

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  is_active INTEGER DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_config_key ON app_config(key);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  user_id TEXT,
  user_email TEXT,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Seed default config
INSERT OR IGNORE INTO app_config (key, value, description) VALUES
  ('app_settings', '{"appName":"DAKKHO","maintenanceMode":false,"maxUploadSize":500,"defaultLanguage":"bn"}', 'General app settings'),
  ('streaming', '{"defaultQuality":"720p","maxConcurrentStreams":3,"enableDVR":true,"enableChat":true}', 'Streaming config'),
  ('notifications', '{"pushEnabled":true,"emailEnabled":true,"smsEnabled":false}', 'Notification settings'),
  ('features', '{"enableCourses":true,"enableLiveClasses":true,"enableQuizzes":true,"enableCertificates":true,"enableLeaderboard":true}', 'Feature flags');
