BEGIN TRANSACTION;

PRAGMA foreign_keys = OFF;

CREATE TABLE user_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT INTO user_new (id, name, email, created_at, updated_at)
SELECT
    id,
    CASE
        WHEN name IS NULL OR name = '' THEN 'Unknown User'
        ELSE name
    END,
    COALESCE(email, 'unknown@example.local'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM user;

DROP TABLE user;
ALTER TABLE user_new RENAME TO user;

CREATE TABLE IF NOT EXISTS sso_app (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_code TEXT NOT NULL UNIQUE,
    display_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_identity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    app_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    email_snapshot TEXT NOT NULL,
    name_snapshot TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (app_id) REFERENCES sso_app(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_identity_app_provider_subject
    ON user_identity(app_id, provider, provider_subject);
CREATE INDEX IF NOT EXISTS idx_user_identity_user_id ON user_identity(user_id);

CREATE TABLE IF NOT EXISTS user_session (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    identity_id INTEGER NOT NULL,
    app_id INTEGER NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (identity_id) REFERENCES user_identity(id),
    FOREIGN KEY (app_id) REFERENCES sso_app(id)
);

CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON user_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_identity_id ON user_session(identity_id);
CREATE INDEX IF NOT EXISTS idx_user_session_app_id ON user_session(app_id);
CREATE INDEX IF NOT EXISTS idx_user_session_expires_at ON user_session(expires_at);

INSERT INTO sso_app (app_code, display_name, created_at, updated_at)
VALUES (
    'legacy-local',
    'Legacy Local',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(app_code) DO NOTHING;

INSERT INTO user_identity (
    user_id,
    app_id,
    provider,
    provider_subject,
    email_snapshot,
    name_snapshot,
    created_at,
    updated_at
)
SELECT
    u.id,
    a.id,
    'legacy',
    CAST(u.id AS TEXT),
    u.email,
    u.name,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM user u
JOIN sso_app a ON a.app_code = 'legacy-local';

PRAGMA foreign_keys = ON;

COMMIT;
