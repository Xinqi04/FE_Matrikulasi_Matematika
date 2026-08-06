import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle, Lock, History, Target } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getSoalMahasiswa, submitJawaban, getHasilBab } from "../../api"

const RIWAYAT_META = {
  remedial: { label: "Remedial", variant: "red" },
  pengayaan: { label: "Pengayaan", variant: "orange" },
  lanjut: { label: "Siap Lanjut", variant: "green" },
}

const BabSoal = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const modulId = location.state?.modulId

  const [soal, setSoal] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadError, setLoadError] = useState("")
  const [riwayat, setRiwayat] = useState(null)

  const load = () => {
    setLoading(true)
    setLoadError("")
    getSoalMahasiswa(id).then(setSoal).catch((err) => setLoadError(err.message || "Gagal memuat soal")).finally(() => setLoading(false))
    getHasilBab(id).then((hasil) => setRiwayat(hasil.nilai_bab !== null ? hasil : null)).catch(console.error)
  }

  useEffect(load, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const jawaban = Object.entries(answers)
      .filter(([, text]) => text && text.trim())
      .map(([soal_id, teks_jawaban]) => ({ soal_id, teks_jawaban }))

    if (jawaban.length === 0) {
      setError("Isi minimal satu jawaban sebelum mengirim.")
      return
    }

    setSubmitting(true)
    try {
      const res = await submitJawaban(id, jawaban)
      setSuccess(res.detail)
      setAnswers({})
      load()
    } catch (err) {
      setError(err.message || "Gagal mengirim jawaban")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="mahasiswa">
      <button
        onClick={() => navigate(modulId ? `/mahasiswa/ujian/${modulId}` : "/mahasiswa/ujian")}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Bab
      </button>

      <h1 className="text-xl md:text-2xl font-bold mb-1">Kerjakan Soal</h1>
      <p className="text-sm text-gray-500 mb-6">Jawab soal berikut, jawaban akan dinilai oleh dosen.</p>

      {riwayat && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-3 text-slate-500">
            <History size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Percobaan Sebelumnya</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-3xl font-black text-gray-900">{riwayat.nilai_bab}</span>
            <Badge variant={RIWAYAT_META[riwayat.status]?.variant || "gray"}>
              {RIWAYAT_META[riwayat.status]?.label || riwayat.status}
            </Badge>
          </div>
          {riwayat.konsep_fokus.length > 0 && (riwayat.status === "remedial" || riwayat.status === "pengayaan") && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mb-2">
                <Target size={13} /> Soal di bawah cuma menguji konsep yang masih lemah:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {riwayat.konsep_fokus.map((k) => <Badge key={k} variant="orange">{k}</Badge>)}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 text-green-700 text-sm font-medium">
              <CheckCircle2 size={18} /> {success}
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle size={18} /> {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat soal...</div>
      ) : loadError ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 flex flex-col items-center gap-2">
          <Lock size={28} className="text-gray-300" />
          {loadError}
        </div>
      ) : soal.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Belum ada soal untuk bab ini.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {soal.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-gray-400">Soal {idx + 1}</span>
                <Badge variant={s.tipe === "esai" ? "purple" : "blue"}>{s.tipe.replace("_", " ")}</Badge>
                {s.sudah_dijawab && <Badge variant="green">Sudah dijawab</Badge>}
              </div>
              <p className="text-sm text-gray-800 font-medium mb-3">{s.teks_soal}</p>
              <textarea
                rows={s.tipe === "esai" ? 4 : 2}
                placeholder="Tulis jawabanmu di sini..."
                value={answers[s.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [s.id]: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
              />
            </motion.div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-xl bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Jawaban</>}
          </button>
        </form>
      )}
    </DashboardLayout>
  )
}

export default BabSoal
