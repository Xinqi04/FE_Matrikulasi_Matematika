import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Loader2, RefreshCcw, Target, TrendingUp } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { getHasilBab } from "../../api"

const META = {
  remedial: { label: "Perlu Remedial", color: "border-red-100 bg-red-50 text-red-700", note: "Pelajari rekomendasi lalu kerjakan ulang latihan bab." },
  pengayaan: { label: "Selesai · Perlu Penguatan", color: "border-amber-100 bg-amber-50 text-amber-700", note: "Bab dinyatakan selesai. Beberapa konsep tetap perlu dikuatkan." },
  lanjut: { label: "Lulus", color: "border-green-100 bg-green-50 text-green-700", note: "Semua konsep utama sudah mencapai batas ketuntasan." },
}

const HasilBab = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const [hasil, setHasil] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => { let active = true; getHasilBab(id).then((value) => active && setHasil(value)).catch((err) => active && setError(err.message)); return () => { active = false } }, [id])

  if (error) return <DashboardLayout role="mahasiswa"><div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">{error}</div></DashboardLayout>
  if (!hasil) return <DashboardLayout role="mahasiswa"><div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-gray-400"><Loader2 className="animate-spin" size={18} /> Memuat analisis...</div></DashboardLayout>
  if (hasil.status === "belum_ada_nilai") return <DashboardLayout role="mahasiswa"><div className="rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center text-amber-700">Jawaban masih menunggu penilaian dosen. Analisis akan tersedia setelah nilai selesai.</div></DashboardLayout>

  const konsep = Object.entries(hasil.nilai_per_konsep || {}).sort((a, b) => a[1] - b[1])
  const kuat = konsep.filter(([, nilai]) => nilai >= 70)
  const lemah = konsep.filter(([, nilai]) => nilai < 70)
  const meta = META[hasil.status] || META.lanjut

  return <DashboardLayout role="mahasiswa">
    <button onClick={() => navigate(state.modulId ? `/mahasiswa/modul/${state.modulId}` : "/mahasiswa/dashboard")} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700"><ArrowLeft size={16} /> Kembali ke Modul</button>
    <header className="mb-7"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">{state.modulNama || "Matrikulasi"}</p><h1 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">Analisis Hasil Belajarmu</h1><p className="mt-2 text-sm text-gray-500">Ringkasan penguasaan konsep pada {state.babNama || "bab ini"}.</p></header>

    <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm"><p className="text-xs font-bold uppercase text-gray-500">Skor Bab</p><p className="my-5 text-6xl font-semibold text-blue-800">{hasil.nilai_bab}<span className="text-lg">/100</span></p><span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${meta.color}`}>{meta.label}</span><p className="mt-4 text-xs leading-5 text-gray-500">{meta.note}</p></Motion.article>
      <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-700" /><h2 className="font-semibold text-gray-900">Penguasaan per Konsep</h2></div><div className="space-y-5">{konsep.map(([nama, nilai]) => <div key={nama}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-gray-700">{nama}</span><strong>{nilai}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><Motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(nilai, 100)}%` }} className={`h-full rounded-full ${nilai >= 70 ? "bg-green-500" : "bg-amber-500"}`} /></div></div>)}</div></article>
    </section>

    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-green-100 bg-white p-5"><div className="mb-4 flex items-center gap-2 text-green-700"><TrendingUp size={18} /><h2 className="font-semibold">Kekuatanmu</h2></div>{kuat.length ? <div className="space-y-2">{kuat.map(([nama, nilai]) => <div key={nama} className="flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm"><span>{nama}</span><strong className="text-green-700">{nilai}%</strong></div>)}</div> : <p className="text-sm text-gray-400">Belum ada konsep yang mencapai batas ketuntasan.</p>}</article>
      <article className="rounded-2xl border border-amber-100 bg-white p-5"><div className="mb-4 flex items-center gap-2 text-amber-700"><Target size={18} /><h2 className="font-semibold">Masih Perlu Dikuatkan</h2></div>{lemah.length ? <div className="space-y-2">{lemah.map(([nama, nilai]) => <div key={nama} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm"><span>{nama}</span><strong className="text-amber-700">{nilai}%</strong></div>)}</div> : <p className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 size={17} /> Semua konsep sudah tuntas.</p>}</article>
    </section>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">{hasil.status === "remedial" && <button onClick={() => navigate(`/mahasiswa/bab/${id}`, { state })} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 px-5 text-sm font-bold text-blue-700"><RefreshCcw size={16} /> Kerjakan Ulang</button>}<button onClick={() => navigate(`/mahasiswa/bab/${id}/rekomendasi`, { state })} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-bold text-white">{hasil.status === "lanjut" ? "Lihat Materi Lanjutan" : "Lihat Materi Penguatan"} <ArrowRight size={16} /></button></div>
  </DashboardLayout>
}

export default HasilBab
