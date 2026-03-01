import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
})

// ── Persons ────────────────────────────────────────
export const getPersons = (params) => api.get('/persons', { params })
export const getPersonById = (id) => api.get(`/persons/${id}`)
export const createPerson = (data) => api.post('/persons', data)
export const updatePerson = (id, data) => api.put(`/persons/${id}`, data)
export const deletePerson = (id) => api.delete(`/persons/${id}`)

// ── Students ───────────────────────────────────────
export const getStudents = (params) => api.get('/students', { params })
export const getStudentByIdentifier = (id) => api.get(`/students/${id}`)
export const createStudent = (data) => api.post('/students', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const updateStudentStatus = (id, data) => api.patch(`/students/${id}/status`, data)
export const addStudentRole = (person_id, data) => api.post(`/students/add-role/${person_id}`, data)

// ── Search & Stats ────────────────────────────────
export const globalSearch = (params) => api.get('/search', { params })
export const getStats = () => api.get('/stats')
export const getStatusHistory = (role, identifier) => api.get(`/history/${role}/${identifier}`)

export default api
