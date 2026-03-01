import { Routes, Route, Navigate } from "react-router-dom"
import StaffList from "./pages/StaffList"
import StaffDetails from "./pages/StaffDetails"

export default function App() {
  return (
    <Routes>
      {/* HOME */}
      <Route path="/" element={<Navigate to="/staff" replace />} />

      {/* STAFF */}
      <Route path="/staff" element={<StaffList />} />
      <Route path="/staff/:identifier" element={<StaffDetails />} />

      {/* optional: if someone types random url */}
      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  )
}
