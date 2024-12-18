import http from "http";
import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const MIGRATION_SQL = `
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
`;

// PostgreSQL connection pool
const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? `postgresql://postgres:password@localhost:5432/electric`,
});

// Helper to execute migration
const runMigration = async () => {
  try {
    console.log("Running migration...");
    await db.query(MIGRATION_SQL);
    console.log("Migration executed successfully.");
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1); // Exit the server if migration fails
  }
};

// Helper to read request body
const getRequestBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
};

// JSON and CORS headers
const JSON_HEADERS = { "Content-Type": "application/json" };
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Define routes and queries
const routes = {
  POST: {
    "/users": async (req) => {
      const { email } = JSON.parse(await getRequestBody(req));
      const result = await db.query(`INSERT INTO users (email) VALUES ($1) RETURNING *`, [email]);
      return { status: 200, body: result.rows[0] };
    },
    "/emails": async (req) => {
      const { user_id, email_address } = JSON.parse(await getRequestBody(req));
      const result = await db.query(
        `INSERT INTO emails (user_id, email_address) VALUES ($1, $2) RETURNING *`,
        [user_id, email_address],
      );
      return { status: 200, body: result.rows[0] };
    },
  },
  PUT: {
    "/users": async (req) => {
      const { id, email } = JSON.parse(await getRequestBody(req));
      const result = await db.query(`UPDATE users SET email = $1 WHERE id = $2 RETURNING *`, [
        email,
        id,
      ]);
      return { status: 200, body: result.rows[0] };
    },
    "/emails": async (req) => {
      const { id, email_address } = JSON.parse(await getRequestBody(req));
      const result = await db.query(
        `UPDATE emails SET email_address = $1 WHERE id = $2 RETURNING *`,
        [email_address, id],
      );
      return { status: 200, body: result.rows[0] };
    },
  },
  DELETE: {
    "/users": async (req) => {
      const ids = JSON.parse(await getRequestBody(req)); // Array of user IDs
      await db.query(`DELETE FROM users where id = ANY($1);`, [ids]);
      return { status: 200, body: { message: `Users deleted` } };
    },
    "/emails": async (req) => {
      const ids = JSON.parse(await getRequestBody(req)); // Array of email IDs
      await db.query(`DELETE FROM emails where id = ANY($1);`, [ids]);
      return { status: 200, body: { message: `Emails deleted` } };
    },
  },
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // console.log(req.method, req.url);
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    // Match route and method
    const handler = routes[req.method]?.[req.url];
    if (handler) {
      const { status, body } = await handler(req);
      res.writeHead(status, { ...JSON_HEADERS, ...CORS_HEADERS });
      res.end(JSON.stringify(body));
      return;
    }

    // Default 404 response
    res.writeHead(404, { ...JSON_HEADERS, ...CORS_HEADERS });
    res.end(JSON.stringify({ error: `Not Found` }));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { ...JSON_HEADERS, ...CORS_HEADERS });
    res.end(JSON.stringify({ error: `Something went wrong` }));
  }
});

// Run migration and start the server
(async () => {
  await runMigration(); // Run migration before starting the server
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
