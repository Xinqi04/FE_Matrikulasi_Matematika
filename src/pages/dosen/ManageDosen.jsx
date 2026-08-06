import { useState } from "react"
import { motion } from "framer-motion"
import { UserCog, Copy, Check, AlertCircle } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"

import { buatDosen } from "../../api"

const ManageDosen = () => {
  const [form, setForm] = useState({ nama: "", email: "" })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setError("")
    setCreating(true)
    try {
      const result = await buatDosen(form)
      setCreated(result)
      setForm({ nama: "", email: "" })
      setCopied(false)
    } catch (err) {
      setError(err.message || "Gagal membuat akun dosen")
    } finally {
      setCreating(false)
    }
  }

  return (
    <DashboardLayout role="dosen" title="Kelola Dosen" subtitle="Buat akun dosen baru untuk sistem.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <UserCog size={20} />
            </div>
            <h2 className="font-bold">Tambah Akun Dosen</h2>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
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
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400"
            >
              {creating ? "Menyimpan..." : "Buat Akun Dosen"}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="font-bold mb-4">Akun Terbaru</h2>
          {!created ? (
            <div className="text-center py-14">
              <p className="text-sm text-gray-400 font-medium">Belum ada akun dosen dibuat pada sesi ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-sm text-green-700 font-medium">
                Akun berhasil dibuat untuk <span className="font-bold">{created.nama}</span> ({created.email}).
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
                <p className="text-[11px] text-slate-400 mt-2">Bagikan password ini ke dosen. Password tidak akan ditampilkan lagi.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default ManageDosen
