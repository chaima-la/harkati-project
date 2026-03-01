const pool = require('../config/db');

// GET /api/students
const getStudents = async (req, res, next) => {
    try {
        const { status, category, faculty, department, scholarship } = req.query;

        let query = `
            SELECT vs.*, vs.student_category AS category,
                   p.place_of_birth, p.nationality
            FROM view_students vs
            JOIN person p ON p.id = vs.person_id
            WHERE 1=1`;
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}::account_status`;
        }
        if (category) {
            params.push(category);
            query += ` AND student_category = $${params.length}::student_category`;
        }
        if (faculty) {
            params.push(`%${faculty}%`);
            query += ` AND faculty ILIKE $${params.length}`;
        }
        if (department) {
            params.push(`%${department}%`);
            query += ` AND department ILIKE $${params.length}`;
        }
        if (scholarship !== undefined) {
            params.push(scholarship === 'true');
            query += ` AND scholarship_status = $${params.length}`;
        }

        query += ` ORDER BY last_name, first_name`;

        const result = await pool.query(query, params);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/students/:identifier
const getStudentByIdentifier = async (req, res, next) => {
    try {
        const { identifier } = req.params;

        const result = await pool.query(
            `SELECT vs.*, vs.student_category AS category,
                    p.place_of_birth, p.nationality
             FROM view_students vs
             JOIN person p ON p.id = vs.person_id
             WHERE vs.identifier = $1`, [identifier]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// POST /api/students
// Creates person + student role in one transaction
const createStudent = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            // Person fields
            first_name, last_name, date_of_birth, place_of_birth,
            nationality, gender, email, phone_number,
            // Student fields
            category = 'undergraduate', entry_year,
            faculty, department, chosen_major, chosen_program,
            student_group, high_school_diploma_type,
            high_school_diploma_year, high_school_honors,
            scholarship_status = false,
            supervisor_faculty_id, home_institution, expected_departure_date
        } = req.body;

        // Duplicate check
        const dup = await client.query(
            `SELECT id FROM person
       WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) AND date_of_birth = $3`,
            [first_name, last_name, date_of_birth]
        );
        if (dup.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'A person with this name and date of birth already exists',
                existing_id: dup.rows[0].id
            });
        }

        // Insert person
        const personResult = await client.query(
            `INSERT INTO person (first_name, last_name, date_of_birth, place_of_birth, nationality, gender, email, phone_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
            [first_name, last_name, date_of_birth, place_of_birth, nationality, gender, email, phone_number]
        );
        const person_id = personResult.rows[0].id;

        // Generate identifier
        const year = entry_year || new Date().getFullYear();
        const prefix = category === 'phd_candidate' ? 'PHD' : 'STU';
        const idResult = await client.query(
            `SELECT fn_generate_identifier($1, $2) AS identifier`, [prefix, year]
        );
        const identifier = idResult.rows[0].identifier;

        // Insert student
        const studentResult = await client.query(
            `INSERT INTO students
        (person_id, identifier, category, status, entry_year, faculty, department,
         chosen_major, chosen_program, student_group, high_school_diploma_type,
         high_school_diploma_year, high_school_honors, scholarship_status,
         supervisor_faculty_id, home_institution, expected_departure_date)
       VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
            [person_id, identifier, category, year, faculty, department,
                chosen_major, chosen_program, student_group, high_school_diploma_type,
                high_school_diploma_year, high_school_honors, scholarship_status,
                supervisor_faculty_id || null, home_institution || null, expected_departure_date || null]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: `Student account created with ID ${identifier}`,
            data: { person_id, ...studentResult.rows[0] }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// POST /api/students/add-role/:person_id
// Adds student role to an existing person (e.g. faculty becoming a PhD student)
const addStudentRole = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { person_id } = req.params;
        const {
            category = 'phd_candidate', entry_year,
            faculty, department, chosen_major, chosen_program,
            scholarship_status = false, supervisor_faculty_id
        } = req.body;

        // Check person exists
        const personCheck = await client.query(`SELECT id FROM person WHERE id = $1`, [person_id]);
        if (personCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        const year = entry_year || new Date().getFullYear();
        const prefix = category === 'phd_candidate' ? 'PHD' : 'STU';
        const idResult = await client.query(
            `SELECT fn_generate_identifier($1, $2) AS identifier`, [prefix, year]
        );
        const identifier = idResult.rows[0].identifier;

        const result = await client.query(
            `INSERT INTO students
        (person_id, identifier, category, status, entry_year, faculty, department,
         chosen_major, chosen_program, scholarship_status, supervisor_faculty_id)
       VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
            [person_id, identifier, category, year, faculty, department,
                chosen_major, chosen_program, scholarship_status, supervisor_faculty_id || null]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: `Student role added with ID ${identifier}`,
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// PATCH /api/students/:identifier/status
const updateStudentStatus = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { identifier } = req.params;
        const { status, reason, changed_by = 'system' } = req.body;

        const current = await client.query(
            `SELECT id, status FROM students WHERE identifier = $1`, [identifier]
        );
        if (current.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const old_status = current.rows[0].status;
        const student_id = current.rows[0].id;

        // Enforce allowed transitions
        const allowed = {
            pending: ['active'],
            active: ['suspended', 'inactive'],
            suspended: ['active'],
            inactive: ['archived'],
            archived: []
        };

        if (!allowed[old_status].includes(status)) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Transition from '${old_status}' to '${status}' is not allowed`,
                allowed_next: allowed[old_status]
            });
        }

        await client.query(`UPDATE students SET status = $1 WHERE id = $2`, [status, student_id]);

        await client.query(
            `INSERT INTO status_history (student_id, old_status, new_status, changed_by, reason)
       VALUES ($1,$2,$3,$4,$5)`,
            [student_id, old_status, status, changed_by, reason || null]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Status changed from '${old_status}' to '${status}'`,
            data: { identifier, old_status, new_status: status }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// PUT /api/students/:identifier
const updateStudent = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        const {
            category, faculty, department, chosen_major, chosen_program,
            student_group, scholarship_status, supervisor_faculty_id
        } = req.body;

        const result = await pool.query(
            `UPDATE students SET
        category              = COALESCE($1::student_category, category),
        faculty               = COALESCE($2, faculty),
        department            = COALESCE($3, department),
        chosen_major          = COALESCE($4, chosen_major),
        chosen_program        = COALESCE($5, chosen_program),
        student_group         = COALESCE($6, student_group),
        scholarship_status    = COALESCE($7, scholarship_status),
        supervisor_faculty_id = COALESCE($8, supervisor_faculty_id)
       WHERE identifier = $9
       RETURNING *`,
            [category, faculty, department, chosen_major, chosen_program,
                student_group, scholarship_status, supervisor_faculty_id, identifier]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getStudents, getStudentByIdentifier,
    createStudent, addStudentRole,
    updateStudent, updateStudentStatus
};