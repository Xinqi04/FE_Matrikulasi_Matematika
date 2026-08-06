import { useEffect, useState } from "react"
import { Plus, Copy, Check, ToggleLeft, ToggleRight, AlertCircle, BookOpen } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Modal from "../../components/Modal"
import Badge from "../../components/Badge"
import {
  listMahasiswa, buatMahasiswa, setAktifMahasiswa,
  getModul, getModulMahasiswa, setModulMahasiswa,
} from "../../api"

const ManageMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([])
  const [modul, setModul] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nama: "", email: "", nim: "" })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  const [assignTarget, setAssignTarget] = useState(null)
  const [assignModulIds, setAssignModulIds] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignSaving, setAssignSaving] = useState(false)

  const load = () => {
    setLoading(true)
    listMahasiswa().then(setMahasiswa).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])
  useEffect(() => {
    getModul().then(setModul).catch(console.error)
  }, [])

  const openAssign = (m) => {
    setAssignTarget(m)
    setAssignLoading(true)
    getModulMahasiswa(m.id)
      .then((res) => setAssignModulIds(res.modul_ids))
      .catch(console.error)
      .finally(() => setAssignLoading(false))
  }

  const closeAssign = () => {
    setAssignTarget(null)
    setAssignModulIds([])
  }

  const toggleAssignModul = (modulId) => {
    setAssignModulIds((prev) =>
      prev.includes(modulId) ? prev.filter((id) => id !== modulId) : [...prev, modulId]
    )
  }

  const handleSaveAssign = async () => {
    setAssignSaving(true)
    try {
      await setModulMahasiswa(assignTarget.id, assignModulIds)
      closeAssign()
    } finally {
      setAssignSaving(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError("")
    setCreating(true)
    try {
      const result = await buatMahasiswa(form)
      setCreated(result)
      setForm({ nama: "", email: "", nim: "" })
      load()
    } catch (err) {
      setError(err.message || "Gagal membuat akun mahasiswa")
    } finally {
      setCreating(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setCreated(null)
    setError("")
    setCopied(false)
  }

  const toggleAktif = async (m) => {
    await setAktifMahasiswa(m.id, !m.aktif)
    load()
  }

  return (
    <DashboardLayout role="dosen" title="Kelola Mahasiswa" subtitle="Buat akun dan atur status aktif mahasiswa.">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all"
        >
          <Plus size={16} /> Tambah Mahasiswa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600">Nama</th>
                <th className="p-4 text-left font-semibold text-gray-600">Email</th>
                <th className="p-4 text-left font-semibold text-gray-600">NIM</th>
                <th className="p-4 text-center font-semibold text-gray-600">Status</th>
                <th className="p-4 text-center font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : mahasiswa.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada mahasiswa terdaftar.</td></tr>
              ) : mahasiswa.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{m.nama}</td>
                  <td className="p-4 text-gray-500">{m.email}</td>
                  <td className="p-4 text-gray-500">{m.nim || "-"}</td>
                  <td className="p-4 text-center">
                    <Badge variant={m.aktif ? "green" : "red"}>{m.aktif ? "Aktif" : "Nonaktif"}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openAssign(m)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors flex"
                        title="Assign Modul"
                      >
                        <BookOpen size={18} />
                      </button>
                      <button
                        onClick={() => toggleAktif(m)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors flex"
                        title={m.aktif ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {m.aktif ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Tambah Mahasiswa">
        {created ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-sm text-green-700 font-medium">
              Akun berhasil dibuat untuk <span className="font-bold">{created.nama}</span>.
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password Awal</label>
              <div className="mt-1 flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3">
                <code className="flex-1 font-bold text-slate-700 break-all">{created.password_awal}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(created.password_awal)
                    setCopied(true)
                  }}
                  className="text-blue-600 hover:text-blue-700 shrink-0"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Bagikan password ini ke mahasiswa. Password tidak akan ditampilkan lagi.</p>
            </div>
            <button
              onClick={closeModal}
              className="w-full py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">NIM</label>
              <input
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400"
            >
              {creating ? "Menyimpan..." : "Buat Akun"}
            </button>
          </form>
        )}
      </Modal>

      <Modal open={!!assignTarget} onClose={closeAssign} title={`Assign Modul — ${assignTarget?.nama || ""}`}>
        {assignLoading ? (
          <div className="text-center text-gray-400 py-6">Memuat data...</div>
        ) : modul.length === 0 ? (
          <div className="text-center text-gray-400 py-6">Belum ada modul tersedia.</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {modul.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={assignModulIds.includes(m.id)}
                    onChange={() => toggleAssignModul(m.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700">{m.nama_domain}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSaveAssign}
              disabled={assignSaving}
              className="w-full py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400"
            >
              {assignSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

export default ManageMahasiswa
