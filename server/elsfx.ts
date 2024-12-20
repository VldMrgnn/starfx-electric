import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";

// Express router
const router = express.Router();

// PostgreSQL setup
const pool = new Pool({
  user: process.env.ELSFXUSER || "",
  host: process.env.ELSFXHOST || "",
  database: process.env.ELSFXDB || "",
  password: process.env.ELSFXPASSWORD || "",
  port: process.env.ELSFXPORT ? parseInt(process.env.ELSFXPORT, 10) : 5432,
});

// Define types for requests
interface UserRequest {
  id?: number;
  email?: string;
}

interface EmailRequest {
  id?: number;
  user_id?: number;
  email_address?: string;
}

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Routes
router.post(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    const { email }: UserRequest = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO users (email) VALUES ($1) RETURNING *`,
      [email]
    );
    res.status(201).json(result.rows[0]);
  })
);
router.put(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    const { id, email }: UserRequest = req.body;

    if (!id || !email) {
      res.status(400).json({ error: "ID and email are required" });
      return;
    }

    const result = await pool.query(
      `UPDATE users SET email = $1 WHERE id = $2 RETURNING *`,
      [email, id]
    );
    res.status(200).json(result.rows[0]);
  })
);
router.delete(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    const ids: number[] = req.body; // Expect an array of user IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "IDs array is required" });
      return;
    }

    await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [ids]);
    res.status(200).json({ message: `Users deleted` });
  })
);
router.post(
  "/emails",
  asyncHandler(async (req: Request, res: Response) => {
    const { user_id, email_address }: EmailRequest = req.body;

    if (!user_id || !email_address) {
      res.status(400).json({ error: "User ID and email address are required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO emails (user_id, email_address) VALUES ($1, $2) RETURNING *`,
      [user_id, email_address]
    );
    res.status(201).json(result.rows[0]);
  })
);
router.put(
  "/emails",
  asyncHandler(async (req: Request, res: Response) => {
    const { id, email_address }: EmailRequest = req.body;

    if (!id || !email_address) {
      res.status(400).json({ error: "ID and email address are required" });
      return;
    }

    const result = await pool.query(
      `UPDATE emails SET email_address = $1 WHERE id = $2 RETURNING *`,
      [email_address, id]
    );
    res.status(200).json(result.rows[0]);
  })
);
router.delete(
  "/emails",
  asyncHandler(async (req: Request, res: Response) => {
    const ids: number[] = req.body; // Expect an array of email IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "IDs array is required" });
      return;
    }

    await pool.query(`DELETE FROM emails WHERE id = ANY($1)`, [ids]);
    res.status(200).json({ message: `Emails deleted` });
  })
);

// Export router
export default router;
