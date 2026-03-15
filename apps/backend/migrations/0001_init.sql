CREATE TABLE IF NOT EXISTS "user" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  password TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS user_user_id_unique ON "user" (user_id);

CREATE TABLE IF NOT EXISTS status_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status_id TEXT NOT NULL,
  metric_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  mapping_type TEXT NOT NULL,
  unit TEXT,
  sort_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS status_metrics_status_metric_unique
  ON status_metrics (status_id, metric_code);

CREATE INDEX IF NOT EXISTS status_metrics_status_sort_idx
  ON status_metrics (status_id, is_active, sort_order);

CREATE TABLE IF NOT EXISTS status_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status_id TEXT NOT NULL,
  metric_id INTEGER NOT NULL,
  record_date TEXT NOT NULL,
  raw_value REAL NOT NULL,
  score INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (metric_id) REFERENCES status_metrics (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS status_logs_status_metric_date_unique
  ON status_logs (status_id, metric_id, record_date);

CREATE INDEX IF NOT EXISTS status_logs_status_date_idx
  ON status_logs (status_id, record_date);
