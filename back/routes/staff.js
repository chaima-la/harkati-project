import express from "express";
import { pool } from "../config/db.js"; // IMPORTANT: your db.js must export pool

const router = express.Router();

/**
 * POST /api/staff
 * Creates a STAFF identity + staff_profile.
 *
 * Expected body:
 * {
 *   person_id: 1,              // you can reuse an existing person created by your friend
 *   entry_year: 2026,
 *   assigned_department_service: "IT Department",
 *   job_title: "Network Technician",
 *   grade: "G3",
 *   entry_date_university: "2026-02-01"
 * }
 */
router.post("/", async(req, res) => {
    const {
        person_id,
        entry_year,
        assigned_department_service,
        job_title,
        grade,
        entry_date_university,
    } = req.body || {};

    // Basic validation (teacher mandatory fields)
    if (!person_id) return res.status(400).json({ error: "person_id is required" });
    if (!Number.isInteger(entry_year)) return res.status(400).json({ error: "entry_year must be an integer (e.g. 2026)" });
    if (!assigned_department_service || !job_title || !grade || !entry_date_university) {
        return res.status(400).json({ error: "Missing staff fields" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1) Create identity with AUTO generated identifier (STF2026xxxxx)
        const identityInsert = await client.query(
            `INSERT INTO identity(person_id, type, entry_year, identifier, status)
       VALUES ($1, 'STF', $2, generate_identifier('STF', $2), 'PENDING')
       RETURNING id, identifier, status, created_at`, [person_id, entry_year]
        );

        const identityId = identityInsert.rows[0].id;

        // 2) Insert staff profile
        await client.query(
            `INSERT INTO staff_profile(identity_id, assigned_department_service, job_title, grade, entry_date_university)
       VALUES ($1, $2, $3, $4, $5)`, [identityId, assigned_department_service, job_title, grade, entry_date_university]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Staff created",
            identifier: identityInsert.rows[0].identifier,
            identity_id: identityId,
        });
    } catch (e) {
        await client.query("ROLLBACK");
        return res.status(500).json({ error: e.message });
    } finally {
        client.release();
    }
});

/**
 * GET /api/staff?q=...
 * Lists/searches staff
 */
router.get("/", async(req, res) => {
    const q = (req.query.q || "").trim();

    const result = await pool.query(
        `SELECT
        i.identifier, i.status, i.entry_year,
        p.first_name, p.last_name, p.email,
        sp.assigned_department_service, sp.job_title, sp.grade, sp.entry_date_university
     FROM identity i
     JOIN person p ON p.id = i.person_id
     JOIN staff_profile sp ON sp.identity_id = i.id
     WHERE i.type='STF'
       AND (
         $1 = '' OR
         i.identifier ILIKE '%'||$1||'%' OR
         p.first_name ILIKE '%'||$1||'%' OR
         p.last_name ILIKE '%'||$1||'%' OR
         p.email ILIKE '%'||$1||'%' OR
         sp.assigned_department_service ILIKE '%'||$1||'%' OR
         sp.job_title ILIKE '%'||$1||'%' OR
         sp.grade ILIKE '%'||$1||'%'
       )
     ORDER BY i.created_at DESC
     LIMIT 200`, [q]
    );

    res.json(result.rows);
});

/**
 * GET /api/staff/:identifier
 * Staff details
 */
router.get("/:identifier", async(req, res) => {
    const { identifier } = req.params;

    const result = await pool.query(
        `SELECT
        i.identifier, i.status, i.entry_year, i.created_at,
        p.*,
        sp.assigned_department_service, sp.job_title, sp.grade, sp.entry_date_university,
        sp.created_at as staff_created_at, sp.updated_at as staff_updated_at
     FROM identity i
     JOIN person p ON p.id = i.person_id
     JOIN staff_profile sp ON sp.identity_id = i.id
     WHERE i.type='STF' AND i.identifier=$1`, [identifier]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Staff not found" });

    res.json(result.rows[0]);
});

/**
 * PUT /api/staff/:identifier
 * Update staff fields
 */
router.put("/:identifier", async(req, res) => {
    const { identifier } = req.params;
    const { assigned_department_service, job_title, grade, entry_date_university } = req.body || {};

    if (!assigned_department_service || !job_title || !grade || !entry_date_university) {
        return res.status(400).json({ error: "Missing staff fields" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const idRow = await client.query(
            `SELECT id FROM identity WHERE identifier=$1 AND type='STF'`, [identifier]
        );
        if (!idRow.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Staff not found" });
        }

        const identityId = idRow.rows[0].id;

        await client.query(
            `UPDATE staff_profile
       SET assigned_department_service=$2,
           job_title=$3,
           grade=$4,
           entry_date_university=$5
       WHERE identity_id=$1`, [identityId, assigned_department_service, job_title, grade, entry_date_university]
        );

        await client.query("COMMIT");
        res.json({ message: "Staff updated" });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: e.message });
    } finally {
        client.release();
    }
});
router.patch("/:identifier/status", async(req, res) => {
    const { identifier } = req.params;
    const { status } = req.body;

    const allowed = ["PENDING", "ACTIVE", "SUSPENDED", "RETIRED"];

    if (!allowed.includes(status)) {
        return res.status(400).json({
            error: "Invalid status"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE identity
       SET status=$2
       WHERE identifier=$1 AND type='STF'
       RETURNING identifier, status`, [identifier, status]
        );

        if (!result.rows.length)
            return res.status(404).json({ error: "Staff not found" });

        res.json({
            message: "Status updated",
            staff: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;