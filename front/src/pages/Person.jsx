import { useState, useEffect, useCallback } from 'react'
import { getPersons, createPerson, updatePerson, deletePerson } from '../services/api'
import Modal from '../components/Modal'
import FormField, { inputCls } from '../components/FormField'
import { validatePersonBase, hasErrors } from '../utils/validation'

const EMPTY_FORM = {
  first_name: '', last_name: '', date_of_birth: '',
  place_of_birth: '', nationality: '', gender: '',
  email: '', phone_number: '',
}
const EMPTY_ERRORS = {
  first_name: null, last_name: null, date_of_birth: null,
  gender: null, email: null, phone_number: null,
}

export default function Persons() {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState(null)

  const fetchPersons = useCallback(() => {
    setLoading(true)
    getPersons(search ? { search } : {})
      .then(r => setPersons(r.data.data))
      .catch(e => setApiError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { fetchPersons() }, [fetchPersons])

  const openAdd = () => { setForm(EMPTY_FORM); setErrors(EMPTY_ERRORS); setEditing(null); setModal('form') }
  const openEdit = (p) => {
    setForm({
      first_name: p.first_name || '', last_name: p.last_name || '',
      date_of_birth: p.date_of_birth?.slice(0, 10) || '',
      place_of_birth: p.place_of_birth || '', nationality: p.nationality || '',
      gender: p.gender || '', email: p.email || '', phone_number: p.phone_number || '',
    })
    setErrors(EMPTY_ERRORS)
    setEditing(p)
    setModal('form')
  }

  // Real-time validation on change
  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...form, [name]: value }
    setForm(next)
    const errs = validatePersonBase(next)
    setErrors(prev => ({ ...prev, [name]: errs[name] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validatePersonBase(form)
    setErrors(errs)
    if (hasErrors(errs)) return
    setSaving(true)
    setApiError(null)
    try {
      if (editing) await updatePerson(editing.id, form)
      else await createPerson(form)
      setModal(null)
      fetchPersons()
    } catch (err) {
      setApiError(err.response?.data?.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete ${p.first_name} ${p.last_name}?\nThis will remove all their roles.`)) return
    try {
      await deletePerson(p.id)
      fetchPersons()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Persons</h1>
          <p className="text-slate-500 mt-0.5">All registered individuals in the system</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Person
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
      </div>

      {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">❌ {apiError}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'DOB', 'Email', 'Phone', 'Gender', 'Nationality', 'Roles', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">Loading…</td></tr>
              ) : persons.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No persons found.</td></tr>
              ) : persons.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-medium text-slate-800">{p.first_name} {p.last_name}</td>
                  <td className="px-5 py-4 text-slate-600">{p.date_of_birth?.slice(0, 10) || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{p.email}</td>
                  <td className="px-5 py-4 text-slate-600">{p.phone_number || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{p.gender || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{p.nationality || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.is_student && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">Student</span>}
                      {p.is_faculty && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Faculty</span>}
                      {p.is_staff && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Staff</span>}
                      {!p.is_student && !p.is_faculty && !p.is_staff && <span className="text-slate-400 text-xs">None</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">Edit</button>
                      <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">{persons.length} record(s)</div>}
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <Modal title={editing ? `Edit — ${editing.first_name} ${editing.last_name}` : 'Add New Person'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {apiError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">⚠️ {apiError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.first_name} required>
                <input name="first_name" value={form.first_name} onChange={handleChange} className={inputCls(errors.first_name)} placeholder="e.g. Ahmed" />
              </FormField>
              <FormField label="Last Name" error={errors.last_name} required>
                <input name="last_name" value={form.last_name} onChange={handleChange} className={inputCls(errors.last_name)} placeholder="e.g. Benali" />
              </FormField>
              <FormField label="Date of Birth" error={errors.date_of_birth} required>
                <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} max="2010-12-31" className={inputCls(errors.date_of_birth)} />
              </FormField>
              <FormField label="Place of Birth">
                <input name="place_of_birth" value={form.place_of_birth} onChange={handleChange} className={inputCls()} placeholder="e.g. Batna" />
              </FormField>
              <FormField label="Nationality">
                <input name="nationality" value={form.nationality} onChange={handleChange} className={inputCls()} placeholder="e.g. Algerian" />
              </FormField>
              <FormField label="Gender" error={errors.gender} required>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputCls(errors.gender)}>
                  <option value="">Select…</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </FormField>
              <FormField label="Email" error={errors.email} required>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls(errors.email)} placeholder="email@example.com" />
              </FormField>
              <FormField label="Phone (10 digits)" error={errors.phone_number} required>
                <input name="phone_number" value={form.phone_number} onChange={handleChange} className={inputCls(errors.phone_number)} placeholder="0700000000" maxLength={10} />
              </FormField>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition text-sm">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Person'}
              </button>
              <button type="button" onClick={() => setModal(null)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}