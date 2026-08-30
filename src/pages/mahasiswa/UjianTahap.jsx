import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { AlertCircle, ArrowLeft, Check, CheckCircle2, FileQuestion, Loader2, Send } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { mulaiUjianModul, submitUjianModul } from "../../api"

const UjianTahap = () => {
  const { id, jenis } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { let active = true; mulaiUjianModul(id, jenis).then((value) => active && setSession(value)).catch((err) => active && setError(err.message)); return () => { active = false } }, [id, jenis])
  const answered = useMemo(() => (session?.soal || []).filter((item) => answers[item.id]?.trim()).length, [answers, session])
  const allAnswered = session?.soal?.length > 0 && answered === session.soal.length
  const progress = session?.soal?.length ? Math.round((answered / session.soal.length) * 100) : 0
  const scrollTo = (index) => document.getElementById(`ujian-soal-${index + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  const submit = async (event) => { event.preventDefault(); if (!allAnswered) return; setSubmitting(true); setError(""); try { await submitUjianModul(id, session.attempt_id, session.soal.map((item) => ({ soal_id: item.id, teks_jawaban: answers[item.id].trim() }))); setSuccess(true); window.scrollTo({ top: 0, behavior: "smooth" }) } catch (err) { setError(err.message) } finally { setSubmitting(false) } }

  return <DashboardLayout role="mahasiswa">
    <button onClick={() => navigate(`/mahasiswa/modul/${id}`)} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700"><ArrowLeft size={16} /> Kembali ke Modul</button>
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{location.state?.modulNama || "Ujian Modul"}</p>
        <h1 className="mt-1 text-3xl font-semibold capitalize text-gray-900">{jenis}</h1>
        <p className="mt-2 text-sm text-gray-500">{jenis === "pretest" ? "Ukur kemampuan awalmu sebelum belajar." : "Ukur peningkatanmu setelah menyelesaikan semua bab."} Ujian ini hanya dapat dikirim satu kali.</p>
      </div>
      {session && (
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:w-56">
          <div className="mb-2 flex justify-between text-xs"><span className="text-gray-500">Terjawab</span><strong className="text-blue-700">{answered}/{session.soal.length}</strong></div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-blue-600" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
    </div>
    {error && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"><AlertCircle size={18} />{error}</div>}
    {success ? <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center"><CheckCircle2 size={34} className="mx-auto text-green-700" /><h2 className="mt-3 font-semibold text-green-800">Jawaban berhasil dikirim</h2><p className="mt-1 text-sm text-green-700">Jawaban menunggu penilaian dosen dan ujian ini tidak dapat diulang.</p><button onClick={() => navigate(`/mahasiswa/modul/${id}`)} className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white">Kembali ke Modul</button></div> : !session && !error ? <div className="rounded-2xl bg-white p-12 text-center text-gray-400">Menyiapkan soal...</div> : session && <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_250px]"><div className="space-y-4">{session.soal.map((item, index) => { const done = Boolean(answers[item.id]?.trim()); return <section id={`ujian-soal-${index + 1}`} key={item.id} className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm ${done ? "border-blue-200" : "border-gray-100"}`}><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span><Badge variant={item.tipe === "esai" ? "purple" : "blue"}>{item.tipe.replace("_", " ")}</Badge></div>{done && <span className="flex items-center gap-1 text-xs font-semibold text-blue-700"><Check size={14} /> Terjawab</span>}</div><p className="mb-4 whitespace-pre-line text-sm font-medium leading-7 text-gray-900">{item.teks_soal}</p><textarea required rows={item.tipe === "esai" ? 5 : 3} value={answers[item.id] || ""} onChange={(e) => setAnswers((current) => ({ ...current, [item.id]: e.target.value }))} placeholder="Tulis jawaban kamu..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" /></section>})}<button type="submit" disabled={!allAnswered || submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">{submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}{submitting ? "Mengirim..." : `Kirim ${jenis}`}</button></div><aside className="sticky top-6 hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:block"><div className="mb-4 flex items-center gap-2"><FileQuestion size={17} className="text-blue-700" /><h2 className="text-sm font-semibold">Navigasi Soal</h2></div><div className="grid grid-cols-5 gap-2">{session.soal.map((item, index) => <button key={item.id} type="button" onClick={() => scrollTo(index)} className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${answers[item.id]?.trim() ? "bg-blue-600 text-white" : "border border-gray-200 bg-gray-50 text-gray-500"}`}>{index + 1}</button>)}</div><div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">Klik nomor untuk menuju soal. Warna teal berarti sudah terjawab.</div></aside></form>}
  </DashboardLayout>
}

export default UjianTahap
