import { BrowserRouter, Routes, Route } from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"

import DosenDashboard from "./pages/dosen/DosenDashboard"
import ManageMahasiswa from "./pages/dosen/ManageMahasiswa"
import ManageDosen from "./pages/dosen/ManageDosen"
import ManageMateri from "./pages/dosen/ManageMateri"
import ManageSoal from "./pages/dosen/ManageSoal"
import Penilaian from "./pages/dosen/Penilaian"
import Jobs from "./pages/dosen/Jobs"

import StudentDashboard from "./pages/mahasiswa/StudentDashboard"
import UjianModul from "./pages/mahasiswa/UjianModul"
import UjianBab from "./pages/mahasiswa/UjianBab"
import BabSoal from "./pages/mahasiswa/BabSoal"
import HasilBab from "./pages/mahasiswa/HasilBab"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        {/* Route Dosen */}
        <Route path="/dosen/dashboard" element={<ProtectedRoute role="dosen"><DosenDashboard /></ProtectedRoute>} />
        <Route path="/dosen/materi" element={<ProtectedRoute role="dosen"><ManageMateri /></ProtectedRoute>} />
        <Route path="/dosen/soal" element={<ProtectedRoute role="dosen"><ManageSoal /></ProtectedRoute>} />
        <Route path="/dosen/penilaian" element={<ProtectedRoute role="dosen"><Penilaian /></ProtectedRoute>} />
        <Route path="/dosen/mahasiswa" element={<ProtectedRoute role="dosen"><ManageMahasiswa /></ProtectedRoute>} />
        <Route path="/dosen/dosen" element={<ProtectedRoute role="dosen"><ManageDosen /></ProtectedRoute>} />
        <Route path="/dosen/jobs" element={<ProtectedRoute role="dosen"><Jobs /></ProtectedRoute>} />

        {/* Route Mahasiswa */}
        <Route path="/mahasiswa/dashboard" element={<ProtectedRoute role="mahasiswa"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/mahasiswa/ujian" element={<ProtectedRoute role="mahasiswa"><UjianModul /></ProtectedRoute>} />
        <Route path="/mahasiswa/ujian/:modulId" element={<ProtectedRoute role="mahasiswa"><UjianBab /></ProtectedRoute>} />
        <Route path="/mahasiswa/bab/:id" element={<ProtectedRoute role="mahasiswa"><BabSoal /></ProtectedRoute>} />
        <Route path="/mahasiswa/bab/:id/hasil" element={<ProtectedRoute role="mahasiswa"><HasilBab /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
