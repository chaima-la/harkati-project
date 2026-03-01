// src/pages/StaffList.jsx
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function StaffList() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    person_id: "",
    entry_year: new Date().getFullYear(),
    assigned_department_service: "",
    job_title: "",
    grade: "",
    entry_date_university: "",
  })

  const [staff, setStaff] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const loadStaff = async (q = "") => {
    try {
      setLoading(true)
      const res = await api.get(`/staff?q=${encodeURIComponent(q)}`)
      setStaff(res.data)
    } catch (err) {
      console.log(err)
      alert("Error loading staff ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff("")
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        person_id: Number(form.person_id),
        entry_year: Number(form.entry_year),
      }

      const res = await api.post("/staff", payload)
      alert(`Staff created ✅ Identifier: ${res.data.identifier}`)

      setIsModalOpen(false)
      setForm({
        person_id: "",
        entry_year: new Date().getFullYear(),
        assigned_department_service: "",
        job_title: "",
        grade: "",
        entry_date_university: "",
      })

      // reload table
      loadStaff(searchTerm)
    } catch (err) {
      console.log(err)
      alert(err?.response?.data?.error || "Error ❌")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-800">Staff Records</h1>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search (Ali, IT, STF...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            onClick={() => loadStaff(searchTerm)}
            className="bg-white hover:bg-blue-50 text-blue-700 px-5 py-2 rounded-lg font-semibold transition border border-blue-200 shadow-sm"
          >
            Search
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Identifier</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Job</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Grade</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-blue-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? "No matching records found" : "No staff yet. Click 'Add New' to create."}
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr
                    key={s.identifier}
                    className="hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => navigate(`/staff/${s.identifier}`)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{s.identifier}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.assigned_department_service}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.job_title}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s.grade}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-800">Add New Staff</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="person_id"
                  placeholder="person_id (example: 1)"
                  value={form.person_id}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                <input
                  type="number"
                  name="entry_year"
                  placeholder="Entry year (example: 2026)"
                  value={form.entry_year}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                <input
                  type="text"
                  name="assigned_department_service"
                  placeholder="Department (IT Department...)"
                  value={form.assigned_department_service}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                <input
                  type="text"
                  name="job_title"
                  placeholder="Job title (Network Technician...)"
                  value={form.job_title}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                <input
                  type="text"
                  name="grade"
                  placeholder="Grade (G3, G4...)"
                  value={form.grade}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                <input
                  type="date"
                  name="entry_date_university"
                  value={form.entry_date_university}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                >
                  Save Staff
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Note: person_id must exist in the <b>person</b> table.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}