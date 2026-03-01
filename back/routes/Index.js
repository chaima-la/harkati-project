const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/Errorhandler');

const personCtrl = require('../controllers/Personcontroller');
const studentCtrl = require('../controllers/Studentcontroller');
const searchCtrl = require('../controllers/Searchcontroller');

// ── Validation rules ────────────────────────────────────────

const personRules = [
    body('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('last_name').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('date_of_birth').isDate().withMessage('Invalid date of birth')
        .custom(v => new Date(v) < new Date()).withMessage('Date of birth cannot be in the future'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone_number').optional().matches(/^[0-9 +\-(). ]+$/).withMessage('Phone number must contain only numbers'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
];

const statusRules = [
    body('status').isIn(['pending', 'active', 'suspended', 'inactive', 'archived'])
        .withMessage('Invalid status value'),
];

const studentCategoryRules = [
    body('category').optional()
        .isIn(['undergraduate', 'continuing_education', 'phd_candidate', 'international_exchange'])
        .withMessage('Invalid student category'),
    body('entry_year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Invalid entry year'),
];

// ── Person routes ───────────────────────────────────────────
// GET  /api/persons              — list/search all persons
// GET  /api/persons/:id          — get one person with all roles
// POST /api/persons              — create bare person (no role)
// PUT  /api/persons/:id          — update person info
// DELETE /api/persons/:id        — delete person (cascades all roles)

router.get('/persons', personCtrl.getPersons);
router.get('/persons/:id', personCtrl.getPersonById);
router.post('/persons', personRules, validate, personCtrl.createPerson);
router.put('/persons/:id', validate, personCtrl.updatePerson);
router.delete('/persons/:id', personCtrl.deletePerson);

// ── Student routes ──────────────────────────────────────────
// GET  /api/students                          — list with filters
// GET  /api/students/:identifier              — get one student
// POST /api/students                          — create person + student role
// POST /api/students/add-role/:person_id      — add student role to existing person
// PUT  /api/students/:identifier              — update student info
// PATCH /api/students/:identifier/status      — change lifecycle status

router.get('/students', studentCtrl.getStudents);
router.get('/students/:identifier', studentCtrl.getStudentByIdentifier);
router.post('/students', [...personRules, ...studentCategoryRules], validate, studentCtrl.createStudent);
router.post('/students/add-role/:person_id', studentCategoryRules, validate, studentCtrl.addStudentRole);
router.put('/students/:identifier', validate, studentCtrl.updateStudent);
router.patch('/students/:identifier/status', statusRules, validate, studentCtrl.updateStudentStatus);

// ── Search & stats routes ───────────────────────────────────
// GET /api/search?q=...&type=student&status=active&year=2024
// GET /api/stats
// GET /api/history/student/:identifier

router.get('/search', searchCtrl.globalSearch);
router.get('/stats', searchCtrl.getStats);
router.get('/history/:role/:identifier', searchCtrl.getStatusHistory);

module.exports = router;