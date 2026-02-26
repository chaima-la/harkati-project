import { useState } from "react"

export default function StudentForm() {
  const [form, setForm] = useState
  ({
    firstName: "",
    lastName: "",
    dob: "",
    placeOfBirth: "",
    nationality: "",
    gender: "",
    email: "",
    phone: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      alert("Person saved ✅")
      console.log(res.data)
    } catch (err) {
      alert("Error ❌")
      console.log(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-white text-center">
          Person Information
        </h2>

        {/* First Name */}
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        {/* Last Name */}
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        {/* Date of Birth */}
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        {/* Place of Birth */}
        <input
          type="text"
          name="placeOfBirth"
          placeholder="Place of Birth"
          value={form.placeOfBirth}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        {/* Nationality */}
        <input
          type="text"
          name="nationality"
          placeholder="Nationality"
          value={form.nationality}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        {/* Gender */}
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        >
          <option value="">Select Gender</option>
          <option>Female</option>
          <option>Male</option>
          <option>Other</option>
        </select>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Personal Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        {/* Phone */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-lg font-semibold transition"
        >
          Save Person
        </button>
      </form>
    </div>
  )
}