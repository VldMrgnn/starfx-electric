-- New migration code added below

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users) THEN
        INSERT INTO users (email)
        SELECT 'user' || seq || '@example.com'
        FROM generate_series(1, 10) AS seq;
    END IF;
END $$;
