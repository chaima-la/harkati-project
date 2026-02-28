// src/pages/StaffDetails.jsx
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../services/api"

export default function StaffDetails() {
  const { identifier } = useParams()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const loadDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/staff/${identifier}`)
      setData(res.data)
      setStatus(res.data.status)
    } catch (err) {
      console.log(err)
      alert("Staff not found ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetails()
  }, [identifier])

  const updateStatus = async () => {
    try {
      const res = await api.patch(`/staff/${identifier}/status`, { status })
      alert(res.data.message || "Status updated ✅")
      loadDetails()
    } catch (err) {
      console.log(err)
      alert(err?.response?.data?.error || "Error updating status ❌")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-blue-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Staff Details</h1>
            <p className="text-gray-500 text-sm">{data.identifier}</p>
          </div>

          <Link
            to="/staff"
            className="bg-white hover:bg-blue-50 text-blue-700 px-5 py-2 rounded-lg font-semibold transition border border-blue-200 shadow-sm"
          >
            Back
          </Link>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="First Name" value={data.first_name} />
          <Info label="Last Name" value={data.last_name} />
          <Info label="Email" value={data.email || "-"} />
          <Info label="Department" value={data.assigned_department_service} />
          <Info label="Job Title" value={data.job_title} />
          <Info label="Grade" value={data.grade} />
          <Info label="Entry Year" value={data.entry_year} />
          <Info label="Entry Date University" value={data.entry_date_university} />
          <Info label="Status" value={data.status} />
        </div>

        <div className="p-6 border-t border-blue-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 items-center w-full sm:w-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full sm:w-64 p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
            >
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="RETIRED">RETIRED</option>
            </select>

            <button
              onClick={updateStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <p className="text-xs text-blue-600 font-semibold">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  )
}