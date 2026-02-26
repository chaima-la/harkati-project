import { Routes, Route } from "react-router-dom"
import Person from "./pages/Person"
import Student from "./pages/Student"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Person />} />
      <Route path="/student" element={<Student />} />
    </Routes>
  )
}

export default App