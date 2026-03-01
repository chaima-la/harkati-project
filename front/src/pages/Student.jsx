import { useState, useEffect, useCallback, useRef } from 'react'
import { getStudents, createStudent, updateStudent, updateStudentStatus, getStatusHistory, addStudentRole } from '../services/api'
import { updatePerson, getPersons } from '../services/api'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import FormField, { inputCls } from '../components/FormField'
import { validatePersonBase, hasErrors } from '../utils/validation'
import DetailModal from '../components/DetailModal'

const EMPTY_FORM = {
  // Person
  first_name: '', last_name: '', date_of_birth: '',
  place_of_birth: '', nationality: '', gender: '', email: '', phone_number: '',
  // Student
  category: 'undergraduate', entry_year: new Date().getFullYear(),
  faculty: '', department: '', student_group: '',
  chosen_major: '', chosen_program: '',
  high_school_diploma_type: '', high_school_diploma_year: '', high_school_honors: '',
  scholarship_status: false,
}

const STATUS_TRANSITIONS = {
  pending: ['active'], active: ['suspended', 'inactive'],
  suspended: ['active'], inactive: ['archived'], archived: [],
}

const SectionTitle = ({ children }) => (
  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest pt-3 pb-1 border-t border-slate-100">{children}</p>
)

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', category: '' })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', reason: '' })
  const [history, setHistory] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [detailRecord, setDetailRecord] = useState(null)
  const [editRecord, setEditRecord] = useState(null)
  // Enroll-existing-person state
  const [enrollMode, setEnrollMode] = useState('new') // 'new' | 'existing'
  const [personSearch, setPersonSearch] = useState('')
  const [personResults, setPersonResults] = useState([])
  const [personSearching, setPersonSearching] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const searchTimer = useRef(null)


  const fetchStudents = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.category) params.category = filters.category
    getStudents(params)
      .then(r => setStudents(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  // Person live search
  const handlePersonSearch = (val) => {
    setPersonSearch(val)
    setSelectedPerson(null)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setPersonResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setPersonSearching(true)
      try {
        const r = await getPersons({ search: val })
        setPersonResults(r.data.data || [])
      } catch { setPersonResults([]) }
      finally { setPersonSearching(false) }
    }, 300)
  }

  const openEnroll = () => {
    setForm(EMPTY_FORM); setErrors({}); setApiError(null)
    setEditRecord(null); setEnrollMode('new')
    setPersonSearch(''); setPersonResults([]); setSelectedPerson(null)
    setModal('add')
  }

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const openEdit = (s) => {
    setEditRecord(s)
    setForm({
      // Person fields
      first_name: s.first_name || '', last_name: s.last_name || '',
      date_of_birth: s.date_of_birth?.slice(0, 10) || '',
      place_of_birth: s.place_of_birth || '', nationality: s.nationality || '',
      gender: s.gender || '', email: s.email || '', phone_number: s.phone_number || '',
      // Student fields
      category: s.category || 'undergraduate',
      entry_year: s.entry_year || new Date().getFullYear(),
      faculty: s.faculty || '', department: s.department || '',
      student_group: s.student_group || '',
      chosen_major: s.chosen_major || '', chosen_program: s.chosen_program || '',
      high_school_diploma_type: s.high_school_diploma_type || '',
      high_school_diploma_year: s.high_school_diploma_year || '',
      high_school_honors: s.high_school_honors || '',
      scholarship_status: s.scholarship_status || false,
    })
    setErrors({})
    setApiError(null)
    setModal('add')
  }

  const validate = (f) => {
    const base = validatePersonBase(f)
    return { ...base }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    const next = { ...form, [name]: val }
    setForm(next)
    const errs = validate(next)
    setErrors(prev => ({ ...prev, [name]: errs[name] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // For existing-person mode, only validate student fields (skip person validation)
    if (enrollMode !== 'existing') {
      const errs = validate(form)
      setErrors(errs)
      if (hasErrors(errs)) return
    } else if (!selectedPerson) {
      setApiError('Please select a person first')
      return
    }
    setSaving(true)
    setApiError(null)
    try {
      if (editRecord) {
        // Update person fields + student fields in parallel
        await Promise.all([
          updatePerson(editRecord.person_id, {
            first_name: form.first_name, last_name: form.last_name,
            date_of_birth: form.date_of_birth, place_of_birth: form.place_of_birth,
            nationality: form.nationality, gender: form.gender,
            email: form.email, phone_number: form.phone_number,
          }),
          updateStudent(editRecord.identifier, {
            category: form.category,
            faculty: form.faculty, department: form.department,
            student_group: form.student_group,
            chosen_major: form.chosen_major, chosen_program: form.chosen_program,
            scholarship_status: form.scholarship_status,
          }),
        ])
      } else if (enrollMode === 'existing' && selectedPerson) {
        // Enroll existing person — pass only student fields
        await addStudentRole(selectedPerson.id, {
          category: form.category,
          entry_year: form.entry_year,
          faculty: form.faculty, department: form.department,
          student_group: form.student_group,
          chosen_major: form.chosen_major, chosen_program: form.chosen_program,
          high_school_diploma_type: form.high_school_diploma_type || undefined,
          high_school_diploma_year: form.high_school_diploma_year || undefined,
          high_school_honors: form.high_school_honors || undefined,
          scholarship_status: form.scholarship_status,
        })
      } else {
        await createStudent(form)
      }
      setModal(null)
      setEditRecord(null)
      fetchStudents()
    } catch (err) {
      setApiError(err.response?.data?.message || (editRecord ? 'Failed to update' : 'Failed to enroll student'))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateStudentStatus(modal.student.identifier, statusForm)
      setModal(null)
      fetchStudents()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const openHistory = async (s) => {
    setSelectedStudent(s)
    setModal('history')
    try {
      const r = await getStatusHistory('student', s.identifier)
      setHistory(r.data.data)
    } catch { setHistory([]) }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 mt-0.5">Student enrollment and management</p>
        </div>
        <button onClick={openEnroll}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Enroll Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="">All Statuses</option>
          {['pending', 'active', 'suspended', 'inactive', 'archived'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="">All Categories</option>
          {['undergraduate', 'continuing_education', 'phd_candidate', 'international_exchange'].map(c =>
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['ID', 'Name', 'Faculty', 'Department', 'Group', 'Category', 'Entry Year', 'Scholarship', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-slate-400">Loading…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-slate-400">No students found.</td></tr>
              ) : students.map(s => (
                <tr key={s.identifier} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-4 font-mono text-xs text-indigo-700 font-semibold whitespace-nowrap">{s.identifier}</td>
                  <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-4 text-slate-600">{s.faculty || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{s.department || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{s.student_group || '—'}</td>
                  <td className="px-4 py-4 text-slate-600 capitalize whitespace-nowrap">{s.category?.replace(/_/g, ' ') || '—'}</td>
                  <td className="px-4 py-4 text-slate-600">{s.entry_year}</td>
                  <td className="px-4 py-4">
                    {s.scholarship_status
                      ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Yes</span>
                      : <span className="text-slate-400 text-xs">No</span>}
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button onClick={() => setDetailRecord(s)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition font-medium">
                        View
                      </button>
                      <button onClick={() => openEdit(s)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-300 hover:bg-indigo-50 text-indigo-700 transition font-medium">
                        Edit
                      </button>
                      {STATUS_TRANSITIONS[s.status]?.length > 0 && (
                        <button onClick={() => { setStatusForm({ status: '', reason: '' }); setModal({ type: 'status', student: s }) }}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition font-medium whitespace-nowrap">
                          Status
                        </button>
                      )}
                      <button onClick={() => openHistory(s)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 text-indigo-600 transition font-medium">
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">{students.length} record(s)</div>}
      </div>

      {/* Detail Slide-over */}
      {detailRecord && (
        <DetailModal type="student" data={detailRecord} onClose={() => setDetailRecord(null)} />
      )}

      {/* Enroll Modal */}
      {modal === 'add' && (
        <Modal title={editRecord ? `Edit Student — ${editRecord.identifier}` : 'Enroll New Student'} onClose={() => { setModal(null); setEditRecord(null) }}>
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {apiError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">⚠️ {apiError}</div>}

            {/* Mode toggle — only shown when creating (not editing) */}
            {!editRecord && (
              <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-1">
                <button type="button"
                  onClick={() => { setEnrollMode('new'); setSelectedPerson(null); setPersonSearch(''); setPersonResults([]) }}
                  className={`flex-1 py-2 text-sm font-semibold transition ${enrollMode === 'new' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  + New Person
                </button>
                <button type="button"
                  onClick={() => setEnrollMode('existing')}
                  className={`flex-1 py-2 text-sm font-semibold transition ${enrollMode === 'existing' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  🔍 Existing Person
                </button>
              </div>
            )}

            {/* Existing-person search */}
            {enrollMode === 'existing' && !editRecord && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Find Person</p>
                <div className="relative">
                  <input
                    value={personSearch}
                    onChange={e => handlePersonSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  {personSearching && (
                    <svg className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
                {personResults.length > 0 && !selectedPerson && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto shadow-sm">
                    {personResults.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => { setSelectedPerson(p); setPersonSearch(`${p.first_name} ${p.last_name}`); setPersonResults([]) }}
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition flex items-center justify-between gap-2 text-sm">
                        <span>
                          <span className="font-medium text-slate-800">{p.first_name} {p.last_name}</span>
                          <span className="ml-2 text-slate-400 text-xs">{p.email}</span>
                        </span>
                        <span className="text-xs text-indigo-500 font-mono">#{p.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedPerson && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedPerson.first_name?.[0]}{selectedPerson.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{selectedPerson.first_name} {selectedPerson.last_name}</p>
                      <p className="text-xs text-slate-500">{selectedPerson.email} · ID #{selectedPerson.id}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedPerson(null); setPersonSearch('') }}
                      className="text-slate-400 hover:text-red-500 transition text-lg leading-none">✕</button>
                  </div>
                )}
                {personSearch && personResults.length === 0 && !personSearching && !selectedPerson && (
                  <p className="text-xs text-slate-400 text-center py-1">No persons found</p>
                )}
              </div>
            )}

            {/* Personal Information — hidden in existing-person mode */}
            {(enrollMode === 'new' || editRecord) && (
              <>
                <SectionTitle>Personal Information</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First Name" error={errors.first_name} required>
                    <input name="first_name" value={form.first_name} onChange={handleChange} className={inputCls(errors.first_name)} placeholder="Ahmed" />
                  </FormField>
                  <FormField label="Last Name" error={errors.last_name} required>
                    <input name="last_name" value={form.last_name} onChange={handleChange} className={inputCls(errors.last_name)} placeholder="Benali" />
                  </FormField>
                  <FormField label="Date of Birth" error={errors.date_of_birth} required>
                    <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} max="2010-12-31" className={inputCls(errors.date_of_birth)} />
                  </FormField>
                  <FormField label="Place of Birth">
                    <input name="place_of_birth" value={form.place_of_birth} onChange={handleChange} className={inputCls()} placeholder="Batna" />
                  </FormField>
                  <FormField label="Nationality">
                    <input name="nationality" value={form.nationality} onChange={handleChange} className={inputCls()} placeholder="Algerian" />
                  </FormField>
                  <FormField label="Gender" error={errors.gender} required>
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputCls(errors.gender)}>
                      <option value="">Select…</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </FormField>
                  <FormField label="Email" error={errors.email} required>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls(errors.email)} placeholder="email@example.com" />
                  </FormField>
                  <FormField label="Phone (10 digits)" error={errors.phone_number} required>
                    <input name="phone_number" value={form.phone_number} onChange={handleChange} className={inputCls(errors.phone_number)} placeholder="0700000000" maxLength={10} />
                  </FormField>
                </div>
              </>
            )}

            {/* Academic, Diploma, Financial — shown for BOTH modes once a person is selected */}
            {(enrollMode === 'new' || editRecord || selectedPerson) && (
              <>
                <SectionTitle>Academic Information</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Category" required>
                    <select name="category" value={form.category} onChange={handleChange} className={inputCls()}>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="continuing_education">Continuing Education</option>
                      <option value="phd_candidate">PhD Candidate</option>
                      <option value="international_exchange">International Exchange</option>
                    </select>
                  </FormField>
                  <FormField label="Entry Year">
                    <input type="number" name="entry_year" value={form.entry_year} onChange={handleChange} className={inputCls()} min="1900" max="2100" />
                  </FormField>
                  <FormField label="Faculty">
                    <input name="faculty" value={form.faculty} onChange={handleChange} className={inputCls()} placeholder="Computer Science" />
                  </FormField>
                  <FormField label="Department">
                    <input name="department" value={form.department} onChange={handleChange} className={inputCls()} placeholder="Dept. of CS" />
                  </FormField>
                  <FormField label="Chosen Major">
                    <input name="chosen_major" value={form.chosen_major} onChange={handleChange} className={inputCls()} placeholder="Software Engineering" />
                  </FormField>
                  <FormField label="Chosen Program">
                    <input name="chosen_program" value={form.chosen_program} onChange={handleChange} className={inputCls()} placeholder="Master Program" />
                  </FormField>
                  <FormField label="Student Group">
                    <input name="student_group" value={form.student_group} onChange={handleChange} className={inputCls()} placeholder="G1" />
                  </FormField>
                </div>

                <SectionTitle>High School Diploma</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Diploma Type">
                    <select name="high_school_diploma_type" value={form.high_school_diploma_type} onChange={handleChange} className={inputCls()}>
                      <option value="">Select…</option>
                      <option value="scientific">Scientific</option>
                      <option value="literary">Literary</option>
                      <option value="technical">Technical</option>
                      <option value="math">Mathematics</option>
                      <option value="management">Management</option>
                    </select>
                  </FormField>
                  <FormField label="Diploma Year">
                    <input type="number" name="high_school_diploma_year" value={form.high_school_diploma_year} onChange={handleChange} className={inputCls()} min="1990" max={new Date().getFullYear()} placeholder="2023" />
                  </FormField>
                  <FormField label="Honors">
                    <select name="high_school_honors" value={form.high_school_honors} onChange={handleChange} className={inputCls()}>
                      <option value="">None</option>
                      <option value="passing">Passing</option>
                      <option value="good">Good</option>
                      <option value="very_good">Very Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </FormField>
                </div>

                <SectionTitle>Financial</SectionTitle>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="scholarship_status" checked={form.scholarship_status} onChange={handleChange} className="rounded accent-indigo-600" />
                  Scholarship recipient
                </label>
              </>
            )}

            <div className="flex gap-3 pt-3">
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition text-sm">
                {saving ? 'Saving…' : editRecord ? 'Save Changes' : enrollMode === 'existing' ? 'Enroll Existing Person' : 'Enroll Student'}
              </button>
              <button type="button" onClick={() => setModal(null)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status Change Modal */}
      {modal?.type === 'status' && (
        <Modal title={`Change Status — ${modal.student.identifier}`} onClose={() => setModal(null)}>
          <form onSubmit={handleStatusChange} className="space-y-4">
            <p className="text-sm text-slate-600">Current: <StatusBadge status={modal.student.status} /></p>
            <FormField label="New Status" required>
              <select value={statusForm.status} onChange={e => setStatusForm({ ...statusForm, status: e.target.value })} className={inputCls()} required>
                <option value="">Select…</option>
                {STATUS_TRANSITIONS[modal.student.status]?.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </FormField>
            <FormField label="Reason">
              <input value={statusForm.reason} onChange={e => setStatusForm({ ...statusForm, reason: e.target.value })} className={inputCls()} placeholder="Optional reason…" />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving || !statusForm.status} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition text-sm">
                {saving ? 'Saving…' : 'Update Status'}
              </button>
              <button type="button" onClick={() => setModal(null)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status History Modal */}
      {modal === 'history' && (
        <Modal title={`Status History — ${selectedStudent?.identifier}`} onClose={() => setModal(null)}>
          {history.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.old_status} />
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      <StatusBadge status={h.new_status} />
                    </div>
                    {h.reason && <p className="text-xs text-slate-500 mt-1">Reason: {h.reason}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">By {h.changed_by} · {new Date(h.changed_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}