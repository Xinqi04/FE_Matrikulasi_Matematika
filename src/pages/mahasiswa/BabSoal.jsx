import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { AlertCircle, ArrowLeft, Check, CheckCircle2, ClipboardCheck, FileQuestion, History, Loader2, Lock, Send, Target } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getHasilBab, getSoalMahasiswa, submitJawaban } from "../../api"

const RIWAYAT_META = {
  remedial: { label: "Remedial", variant: "red" },
  pengayaan: { label: "Pengayaan", variant: "orange" },
  lanjut: { label: "Lulus", variant: "green" },
}

const BabSoal = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { babNama = "Bab Terpilih", modulNama = "Matrikulasi", modulId } = location.state || {}

  const [soal, setSoal] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadError, setLoadError] = useState("")
  const [riwayat, setRiwayat] = useState(null)

  useEffect(() => {
    let active = true

    Promise.allSettled([getSoalMahasiswa(id), getHasilBab(id)])
      .then(([soalResult, hasilResult]) => {
        if (!active) return
        if (soalResult.status === "rejected") throw soalResult.reason
        setSoal(soalResult.value)
        if (hasilResult.status === "fulfilled" && hasilResult.value.nilai_bab !== null) setRiwayat(hasilResult.value)
      })
      .catch((err) => active && setLoadError(err.message || "Gagal memuat soal"))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [id])

  const answeredCount = useMemo(
    () => soal.filter((item) => answers[item.id]?.trim()).length,
    [answers, soal],
  )
  const progress = soal.length ? Math.round((answeredCount / soal.length) * 100) : 0
  const allAnswered = soal.length > 0 && answeredCount === soal.length

  const scrollToQuestion = (index) => {
    document.getElementById(`soal-${index + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!allAnswered) {
      setError(`Masih ada ${soal.length - answeredCount} soal yang belum dijawab.`)
      return
    }

    const jawaban = soal.map((item) => ({ soal_id: item.id, teks_jawaban: answers[item.id].trim() }))
    setSubmitting(true)
    try {
      const response = await submitJawaban(id, jawaban)
      setSuccess(response.detail)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err.message || "Gagal mengirim jawaban")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="mahasiswa">
      <button onClick={() => navigate(modulId ? `/mahasiswa/modul/${modulId}` : "/mahasiswa/ujian")} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-700">
        <ArrowLeft size={16} /> Kembali ke Modul
      </button>

      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{modulNama}</p>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{babNama}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">Kerjakan seluruh soal di bawah, periksa kembali jawabanmu, lalu kirim sekaligus untuk dinilai dosen.</p>
        </div>
        {!loading && soal.length > 0 && (
          <div className="min-w-56 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold"><span className="text-gray-500">Progres jawaban</span><span className="text-blue-700">{answeredCount}/{soal.length}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {success && (
          <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 overflow-hidden">
            <div className="flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-green-700"><CheckCircle2 size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Semua jawaban berhasil dikirim</p><p className="mt-0.5 text-sm">{success}</p></div></div>
              <button onClick={() => navigate(modulId ? `/mahasiswa/modul/${modulId}` : "/mahasiswa/ujian")} className="shrink-0 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-800">Kembali ke Modul</button>
            </div>
          </Motion.div>
        )}
        {error && (
          <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 overflow-hidden">
            <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600"><AlertCircle size={18} /> {error}</div>
          </Motion.div>
        )}
      </AnimatePresence>

      {riwayat && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><History size={19} className="text-amber-700" /><div><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Status pengerjaan sebelumnya</p><div className="mt-1 flex items-center gap-2"><Badge variant={RIWAYAT_META[riwayat.status]?.variant || "gray"}>{RIWAYAT_META[riwayat.status]?.label || riwayat.status}</Badge><span className="text-xs text-gray-500">Nilai hanya dapat dilihat dosen</span></div></div></div>
          {riwayat.konsep_fokus?.length > 0 && <div className="flex max-w-md flex-wrap items-center gap-1.5"><Target size={14} className="mr-1 text-amber-700" />{riwayat.konsep_fokus.map((item) => <Badge key={item} variant="orange">{item}</Badge>)}</div>}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">Memuat seluruh soal...</div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400"><Lock size={28} className="text-gray-300" />{loadError}</div>
      ) : soal.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">Belum ada soal untuk bab ini.</div>
      ) : (
        <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="space-y-4">
            {soal.map((item, index) => {
              const answered = Boolean(answers[item.id]?.trim())
              return (
                <Motion.section
                  id={`soal-${index + 1}`}
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.025, 0.25) }}
                  className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6 ${answered ? "border-blue-200" : "border-gray-100"}`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span><Badge variant={item.tipe === "esai" ? "purple" : "blue"}>{item.tipe.replace("_", " ")}</Badge></div>
                    {answered && <span className="flex items-center gap-1 text-xs font-semibold text-blue-700"><Check size={14} /> Terjawab</span>}
                  </div>
                  <p className="mb-4 whitespace-pre-line text-[15px] font-medium leading-7 text-gray-900">{item.teks_soal}</p>
                  <label htmlFor={`jawaban-${item.id}`} className="mb-2 block text-xs font-semibold text-gray-500">Jawaban kamu</label>
                  <textarea
                    id={`jawaban-${item.id}`}
                    rows={item.tipe === "esai" ? 5 : 3}
                    placeholder="Tulis jawaban dengan jelas di sini..."
                    value={answers[item.id] || ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </Motion.section>
              )
            })}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start gap-3"><ClipboardCheck size={20} className="mt-0.5 text-blue-700" /><div><h2 className="font-semibold text-gray-900">Siap mengirim jawaban?</h2><p className="mt-1 text-sm text-gray-500">Pastikan semua soal sudah terjawab. Jawaban yang dikirim akan menunggu penilaian dosen.</p></div></div>
              <button type="submit" disabled={submitting || !allAnswered || Boolean(success)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none">
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</> : success ? <><CheckCircle2 size={18} /> Jawaban Terkirim</> : <><Send size={17} /> Kirim Semua Jawaban</>}
              </button>
            </div>
          </div>

          <aside className="sticky top-6 hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:block">
            <div className="mb-4 flex items-center gap-2"><FileQuestion size={17} className="text-blue-700" /><h2 className="text-sm font-semibold text-gray-900">Daftar Soal</h2></div>
            <div className="grid grid-cols-5 gap-2">
              {soal.map((item, index) => {
                const answered = Boolean(answers[item.id]?.trim())
                return <button key={item.id} type="button" onClick={() => scrollToQuestion(index)} className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${answered ? "bg-blue-600 text-white" : "border border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300"}`}>{index + 1}</button>
              })}
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4"><div className="flex justify-between text-xs font-medium text-gray-500"><span>Terjawab</span><strong className="text-gray-900">{answeredCount}/{soal.length}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div></div>
          </aside>
        </form>
      )}
    </DashboardLayout>
  )
}

export default BabSoal
