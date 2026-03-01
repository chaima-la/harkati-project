const pool = require('../config/db');

// GET /api/search?q=...&type=student&status=active&year=2024
const globalSearch = async (req, res, next) => {
  try {
    const { q = '', type, status, year } = req.query;

    const results = {};

    // Build common WHERE fragments
    const buildConditions = (tableAlias, extraConditions = '') => {
      const params = [`%${q}%`];
      let where = `WHERE (
                p.first_name ILIKE $1 OR
                p.last_name  ILIKE $1 OR
                p.email      ILIKE $1 OR
                ${tableAlias}.identifier ILIKE $1
            ) ${extraConditions}`;

      if (status) {
        params.push(status);
        where += ` AND ${tableAlias}.status = $${params.length}::account_status`;
      }
      if (year) {
        params.push(parseInt(year));
        where += ` AND ${tableAlias}.entry_year = $${params.length}`;
      }
      return { where, params };
    };

    if (!type || type === 'student') {
      const { where, params } = buildConditions('s');
      const studentQuery = `
                SELECT 'student' AS type, s.identifier, p.first_name, p.last_name,
                       p.email, s.status, s.entry_year, s.faculty, s.department, s.category AS role_category
                FROM students s
                JOIN person p ON p.id = s.person_id
                ${where}
                ORDER BY p.last_name, p.first_name`;
      const studentResult = await pool.query(studentQuery, params);
      results.students = studentResult.rows;
    }

    const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    res.json({ success: true, query: q, total: totalCount, results });
  } catch (err) {
    next(err);
  }
};

// GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const [studentStats, personCount] = await Promise.all([
      pool.query(`
                SELECT status, COUNT(*) AS count
                FROM students
                GROUP BY status
                ORDER BY status`),
      pool.query(`SELECT COUNT(*) AS count FROM person`),
    ]);

    const toMap = (rows) => rows.reduce((acc, r) => {
      acc[r.status] = parseInt(r.count);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total_persons: parseInt(personCount.rows[0].count),
        students: toMap(studentStats.rows),
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/history/student/:identifier
const getStatusHistory = async (req, res, next) => {
  try {
    const { role, identifier } = req.params;

    const roleToTable = {
      student: { table: 'students', fk: 'student_id' },
    };

    const mapping = roleToTable[role];
    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Must be: student`
      });
    }

    // Look up the entity's id from its identifier
    const entityResult = await pool.query(
      `SELECT id FROM ${mapping.table} WHERE identifier = $1`, [identifier]
    );
    if (entityResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `${role} not found` });
    }

    const entity_id = entityResult.rows[0].id;

    const historyResult = await pool.query(
      `SELECT old_status, new_status, changed_by, reason, changed_at
             FROM status_history
             WHERE ${mapping.fk} = $1
             ORDER BY changed_at DESC`,
      [entity_id]
    );

    res.json({ success: true, identifier, role, count: historyResult.rows.length, data: historyResult.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  globalSearch,
  getStats,
  getStatusHistory
};