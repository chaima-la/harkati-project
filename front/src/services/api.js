import axios from "axios"

export const api = axios.create({
    baseURL: "http://localhost:5001/api",
})

export const getStaff = (q = "") =>
    api.get(`/staff${q ? `?q=${encodeURIComponent(q)}` : ""}`).then((r) => r.data)

export const getStaffDetails = (identifier) =>
  api.get(`/staff/${identifier}`).then((r) => r.data)

export const updateStaffStatus = (identifier, status) =>
  api.patch(`/staff/${identifier}/status`, { status }).then((r) => r.data)
