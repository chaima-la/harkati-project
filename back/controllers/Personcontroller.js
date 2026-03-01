const pool = require('../config/db');

// GET /api/persons
// Search by name, email, or get all
const getPersons = async (req, res, next) => {
    try {
        const { search, role } = req.query;

        let query = `
      SELECT
        p.id, p.first_name, p.last_name, p.date_of_birth,
        p.place_of_birth, p.nationality, p.gender,
        p.email, p.phone_number, p.created_at,
        -- Aggregate roles
        CASE WHEN s.id IS NOT NULL THEN true ELSE false END AS is_student,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END AS is_faculty,
        CASE WHEN sm.id IS NOT NULL THEN true ELSE false END AS is_staff
      FROM person p
      LEFT JOIN students        s  ON s.person_id  = p.id
      LEFT JOIN faculty_members f  ON f.person_id  = p.id
      LEFT JOIN staff_members   sm ON sm.person_id = p.id
      WHERE 1=1
    `;

        const params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (p.first_name ILIKE $${params.length}
                   OR p.last_name  ILIKE $${params.length}
                   OR p.email      ILIKE $${params.length})`;
        }

        if (role === 'student') query += ` AND s.id  IS NOT NULL`;
        if (role === 'faculty') query += ` AND f.id  IS NOT NULL`;
        if (role === 'staff') query += ` AND sm.id IS NOT NULL`;

        query += ` ORDER BY p.last_name, p.first_name`;

        const result = await pool.query(query, params);

        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/persons/:id
const getPersonById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get base person info
        const personResult = await pool.query(
            `SELECT * FROM person WHERE id = $1`, [id]
        );

        if (personResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        const person = personResult.rows[0];

        // Get all roles for this person
        const [students, faculty, staff] = await Promise.all([
            pool.query(`SELECT * FROM students        WHERE person_id = $1`, [id]),
            pool.query(`SELECT * FROM faculty_members WHERE person_id = $1`, [id]),
            pool.query(`SELECT * FROM staff_members   WHERE person_id = $1`, [id]),
        ]);

        res.json({
            success: true,
            data: {
                ...person,
                roles: {
                    student: students.rows,
                    faculty: faculty.rows,
                    staff: staff.rows,
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/persons
const createPerson = async (req, res, next) => {
    try {
        const {
            first_name, last_name, date_of_birth,
            place_of_birth, nationality, gender,
            email, phone_number
        } = req.body;

        // Duplicate check (same name + DOB)
        const dupCheck = await pool.query(
            `SELECT id FROM person
       WHERE LOWER(first_name) = LOWER($1)
         AND LOWER(last_name)  = LOWER($2)
         AND date_of_birth     = $3`,
            [first_name, last_name, date_of_birth]
        );

        if (dupCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A person with this name and date of birth already exists',
                existing_id: dupCheck.rows[0].id
            });
        }

        const result = await pool.query(
            `INSERT INTO person
        (first_name, last_name, date_of_birth, place_of_birth, nationality, gender, email, phone_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
            [first_name, last_name, date_of_birth, place_of_birth, nationality, gender, email, phone_number]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// PUT /api/persons/:id
const updatePerson = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            first_name, last_name, date_of_birth,
            place_of_birth, nationality, gender,
            email, phone_number
        } = req.body;

        const result = await pool.query(
            `UPDATE person SET
        first_name    = COALESCE($1, first_name),
        last_name     = COALESCE($2, last_name),
        date_of_birth = COALESCE($3, date_of_birth),
        place_of_birth= COALESCE($4, place_of_birth),
        nationality   = COALESCE($5, nationality),
        gender        = COALESCE($6::person_gender, gender),
        email         = COALESCE($7, email),
        phone_number  = COALESCE($8, phone_number)
       WHERE id = $9
       RETURNING *`,
            [first_name, last_name, date_of_birth, place_of_birth, nationality, gender, email, phone_number, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/persons/:id
const deletePerson = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM person WHERE id = $1 RETURNING id, first_name, last_name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        res.json({ success: true, message: 'Person deleted', data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

module.exports = { getPersons, getPersonById, createPerson, updatePerson, deletePerson };