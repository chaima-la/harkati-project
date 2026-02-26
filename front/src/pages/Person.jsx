import { useState } from "react"

export default function StudentForm() {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    placeOfBirth: "",
    nationality: "",
    gender: "",
    email: "",
    phone: "",
  })

  const [students, setStudents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Simulate API call
      // const res = await axios.post('/api/students', form)
      // console.log(res.data)
      
      // Add new student to list
      setStudents([...students, { ...form, id: Date.now() }])
      
      // Reset form and close modal
      setForm({
        fullName: "",
        dob: "",
        placeOfBirth: "",
        nationality: "",
        gender: "",
        email: "",
        phone: "",
      })
      setIsModalOpen(false)
      alert("Person saved ✅")
    } catch (err) {
      alert("Error ❌")
      console.log(err)
    }
  }

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    Object.values(student).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Header with Search and Add Button */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-800">Student Records</h1>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
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

      {/* Table Display */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date of Birth</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Place of Birth</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nationality</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Gender</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? "No matching records found" : "No students added yet. Click 'Add New' to create a record."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.dob}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.placeOfBirth}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.nationality}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-800">Add New Person</h2>
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
                {/* First Name */}
                <input
                  type="text"
                  name="fullName"
                  placeholder="First Name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

               

                {/* Date of Birth */}
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                {/* Place of Birth */}
                <input
                  type="text"
                  name="placeOfBirth"
                  placeholder="Place of Birth"
                  value={form.placeOfBirth}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                {/* Nationality */}
                <input
                  type="text"
                  name="nationality"
                  placeholder="Nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                {/* Gender */}
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Female</option>
                  <option>Male</option>
                </select>

                {/* Email */}
                <input
                  type="email"
                  name="email"
                  placeholder="Personal Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  required
                />

                {/* Phone */}
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
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
                  Save Person
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold transition"
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