import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lightbulb, Loader2, PlayCircle, RefreshCcw, Target, Youtube } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getHasilBab } from "../../api"

const RekomendasiBab = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const [hasil, setHasil] = useState(null)
  const [error, setError] = useState("")
  const [brokenThumbs, setBrokenThumbs] = useState({})

  useEffect(() => { let active = true; getHasilBab(id).then((value) => active && setHasil(value)).catch((err) => active && setError(err.message)); return () => { active = false } }, [id])

  if (error) return <DashboardLayout role="mahasiswa"><div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">{error}</div></DashboardLayout>
  if (!hasil) return <DashboardLayout role="mahasiswa"><div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-gray-400"><Loader2 className="animate-spin" size={18} /> Memuat rekomendasi...</div></DashboardLayout>

  const fokus = hasil.konsep_fokus || []
  const remedial = hasil.status === "remedial"
  const pengayaan = hasil.status === "pengayaan"
  const lanjut = hasil.status === "lanjut"

  return <DashboardLayout role="mahasiswa">
    <button onClick={() => navigate(`/mahasiswa/bab/${id}/hasil`, { state })} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700"><ArrowLeft size={16} /> Kembali ke Analisis</button>
    <header className="mb-7"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">{state.modulNama || "Matrikulasi"}</p><h1 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">{lanjut ? "Materi Lanjutan untukmu" : "Rekomendasi Penguatan untukmu"}</h1><p className="mt-2 text-sm text-gray-500">{lanjut ? "Kamu sudah menguasai bab ini. Materi berikut disiapkan untuk topik bab selanjutnya." : "Materi dipilih dari konsep yang masih perlu dikuatkan."} Urutannya memakai tingkat kecocokan Jaccard.</p></header>

    {pengayaan && <section className="mb-5 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-amber-800"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div><h2 className="font-semibold">Bab ini sudah selesai</h2><p className="mt-1 text-sm">Kamu boleh lanjut ke bab berikutnya. Catatan penguatan: {fokus.join(", ") || "pertahankan pemahaman yang sudah baik"}.</p></div></section>}
    {lanjut && <section className="mb-5 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-blue-800"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div><h2 className="font-semibold">Bab ini tuntas tanpa catatan penguatan</h2><p className="mt-1 text-sm">Daftar di bawah bukan materi perbaikan. Ini adalah pengantar untuk bab selanjutnya agar kamu lebih siap.</p></div></section>}

    <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Target size={18} className="text-blue-700" /><h2 className="font-semibold text-gray-900">{lanjut ? "Topik yang Akan Dipelajari Berikutnya" : "Fokus Utama yang Perlu Ditingkatkan"}</h2></div>{fokus.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fokus.map((konsep) => { const nilai = hasil.nilai_per_konsep?.[konsep]; return <article key={konsep} className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-sm font-semibold text-gray-900">{konsep}</p><div className="mt-3 flex items-center justify-between text-xs"><span className="text-gray-500">{lanjut ? "Kategori" : "Skor kamu"}</span><strong className="text-blue-700">{lanjut ? "Materi lanjutan" : nilai == null ? "Perlu diperkuat" : `${nilai}%`}</strong></div>{!lanjut && nilai != null && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(nilai, 100)}%` }} /></div>}</article>})}</div> : <p className="text-sm text-green-700">{lanjut ? "Belum ada topik pada bab selanjutnya." : "Semua konsep sudah mencapai batas ketuntasan."}</p>}</section>

    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-100 p-5"><div><h2 className="font-semibold text-gray-900">{lanjut ? "Materi Lanjutan" : "Materi Penguatan"}</h2><p className="mt-1 text-xs text-gray-400">Diurutkan dari kecocokan tertinggi.</p></div><PlayCircle className="text-blue-700" size={21} /></div>
      {hasil.rekomendasi_video?.length ? hasil.rekomendasi_video.map((video, index) => <a key={video.video_id} href={video.link} target="_blank" rel="noreferrer" className="group flex flex-col gap-4 border-b border-gray-100 p-4 last:border-0 hover:bg-blue-50/30 sm:flex-row sm:items-center">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-xs font-bold text-white">{index + 1}</span>
        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-36">{brokenThumbs[video.video_id] ? <div className="flex h-full items-center justify-center text-gray-300"><Youtube size={28} /></div> : <img src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" onError={() => setBrokenThumbs((current) => ({ ...current, [video.video_id]: true }))} />}</div>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-gray-900">{video.judul}</h3><p className="mt-1 text-xs text-gray-400">{video.channel || "Materi pembelajaran"}</p><div className="mt-2 flex flex-wrap gap-1">{video.konsep_cocok.map((item) => <Badge key={item} variant="blue">{item}</Badge>)}</div></div>
        <div className="sm:w-28"><p className="text-right text-sm font-bold text-blue-700">{Math.round(video.jaccard * 100)}%</p><p className="text-right text-[10px] text-gray-400">Kecocokan</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-blue-600" style={{ width: `${video.jaccard * 100}%` }} /></div></div><ArrowRight size={17} className="text-gray-300" />
      </a>) : <div className="p-10 text-center text-sm text-gray-400">Belum ada {lanjut ? "materi lanjutan" : "materi penguatan"} yang cocok.</div>}
    </section>

    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3 text-blue-800"><Lightbulb size={20} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Langkah selanjutnya</p><p className="mt-1 text-sm">{remedial ? "Pelajari materi penguatan lalu ulangi latihan bab." : pengayaan ? "Penguatan bersifat anjuran; kamu sudah boleh lanjut ke bab berikutnya." : "Pelajari pengantar ini atau langsung lanjut ke bab berikutnya."}</p></div></div><div className="flex gap-2">{remedial && <button onClick={() => navigate(`/mahasiswa/bab/${id}`, { state })} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-xs font-bold text-blue-700"><RefreshCcw size={15} /> Ulangi Latihan</button>}<button onClick={() => navigate(state.modulId ? `/mahasiswa/modul/${state.modulId}` : "/mahasiswa/dashboard")} className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-bold text-white"><BookOpen size={15} /> Kembali ke Modul</button></div></div>
  </DashboardLayout>
}

export default RekomendasiBab
