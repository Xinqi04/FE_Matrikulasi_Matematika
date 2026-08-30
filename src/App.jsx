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
import BabSoal from "./pages/mahasiswa/BabSoal"
import ModulUjianDetail from "./pages/mahasiswa/ModulUjianDetail"
import UjianTahap from "./pages/mahasiswa/UjianTahap"
import HasilBab from "./pages/mahasiswa/HasilBab"
import RekomendasiBab from "./pages/mahasiswa/RekomendasiBab"

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
        <Route path="/mahasiswa/modul/:id" element={<ProtectedRoute role="mahasiswa"><ModulUjianDetail /></ProtectedRoute>} />
        <Route path="/mahasiswa/modul/:id/ujian/:jenis" element={<ProtectedRoute role="mahasiswa"><UjianTahap /></ProtectedRoute>} />
        <Route path="/mahasiswa/bab/:id" element={<ProtectedRoute role="mahasiswa"><BabSoal /></ProtectedRoute>} />
        <Route path="/mahasiswa/bab/:id/hasil" element={<ProtectedRoute role="mahasiswa"><HasilBab /></ProtectedRoute>} />
        <Route path="/mahasiswa/bab/:id/rekomendasi" element={<ProtectedRoute role="mahasiswa"><RekomendasiBab /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
