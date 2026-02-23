BEGIN TRANSACTION;

CREATE TABLE user_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    password TEXT
);

INSERT INTO user_new (id, userId, name, email, password)
SELECT id, userId, '' AS name, NULL AS email, password
FROM user;

DROP TABLE user;
ALTER TABLE user_new RENAME TO user;
CREATE UNIQUE INDEX idx_user_userId ON user(userId);

COMMIT;
