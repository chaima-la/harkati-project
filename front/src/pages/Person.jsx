import { useState, useEffect } from "react"

export default function StudentForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    gender: "",
    email: "",
    phone: "",
  })

  const [students, setStudents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all persons on component mount
  useEffect(() => {
    fetchAllPersons()
  }, [])

  const fetchAllPersons = async () => {
    setFetchLoading(true)
    setError(null)
    
    try {
      const response = await fetch("http://localhost:8080/api/person/all")
      
      if (!response.ok) {
        throw new Error("Failed to fetch persons")
      }
      
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load students. Please try again.")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        "http://localhost:8080/api/person/create-person",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create person")
      }

      const data = await response.json()

      // Add returned person to table
      setStudents([data, ...students])

      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        placeOfBirth: "",
        nationality: "",
        gender: "",
        email: "",
        phone: "",
      })

      setIsModalOpen(false)
      alert("Person saved successfully ✅")
    } catch (err) {
      console.error(err)
      alert("Error saving person ❌")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAllPersons()
  }

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-800">Student Records</h1>

        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleRefresh}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            title="Refresh data"
          >
            ↻
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={handleRefresh}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-red-700">Try again</span>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">First Name</th>
              <th className="px-4 py-3 text-left">Last Name</th>
              <th className="px-4 py-3 text-left">Date of Birth</th>
              <th className="px-4 py-3 text-left">Place of Birth</th>
              <th className="px-4 py-3 text-left">Nationality</th>
              <th className="px-4 py-3 text-left">Gender</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
            </tr>
          </thead>

          <tbody>
            {fetchLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading students...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  {searchTerm ? "No matching records found" : "No records available"}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => (
                <tr key={student.id || index} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3">{student.first_name || student.firstName}</td>
                  <td className="px-4 py-3">{student.last_name || student.lastName}</td>
                  <td className="px-4 py-3">{student.date_of_birth || student.dateOfBirth}</td>
                  <td className="px-4 py-3">{student.place_of_birth}</td>
                  <td className="px-4 py-3">{student.nationality}</td>
                  <td className="px-4 py-3">{student.gender}</td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">{student.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Record Count */}
        {!fetchLoading && filteredStudents.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} records
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Person</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <input
                type="text"
                name="placeOfBirth"
                placeholder="Place of Birth"
                value={form.placeOfBirth}
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <input
                type="text"
                name="nationality"
                placeholder="Nationality"
                value={form.nationality}
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 p-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}