import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, LockKeyhole } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { getMahasiswaDashboard } from "../../api"

const selesaiUjian = (status) => ["menunggu_penilaian", "dinilai"].includes(status)

const ModulUjianDetail = () => {
  const { id } = useParams(); const navigate = useNavigate(); const [data, setData] = useState(null)
  useEffect(() => { getMahasiswaDashboard().then(setData).catch(console.error) }, [])
  const modul = data?.modul.find((item) => item.id === id)
  const progressMap = useMemo(() => Object.fromEntries((data?.progress || []).map((item) => [item.bab_id, item])), [data])
  const statusUjian = data?.ujian_modul.find((item) => item.modul_id === id) || {}
  // Status backend menjadi sumber utama. Fallback progress menjaga data lama
  // yang sudah membuka bab tetap dapat dilanjutkan.
  const pretestDone = selesaiUjian(statusUjian.pretest) || Boolean(modul?.bab.some((bab) => {
    const progress = progressMap[bab.id]
    return progress && !progress.locked
  }))
  const semuaBabDone = Boolean(modul?.bab.length) && modul.bab.every((bab) => ["lanjut", "pengayaan"].includes(progressMap[bab.id]?.status))
  const posttestDone = selesaiUjian(statusUjian.posttest)

  if (!data) return <DashboardLayout role="mahasiswa"><div className="rounded-2xl bg-white p-12 text-center text-gray-400">Memuat modul...</div></DashboardLayout>
  if (!modul) return <DashboardLayout role="mahasiswa"><div className="rounded-2xl bg-white p-12 text-center text-gray-400">Modul tidak ditemukan.</div></DashboardLayout>

  return <DashboardLayout role="mahasiswa">
    <button onClick={() => navigate("/mahasiswa/ujian")} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700"><ArrowLeft size={16} /> Kembali ke Pilih Modul</button>
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Modul</p><h1 className="mt-1 text-3xl font-semibold text-gray-900">{modul.nama_domain}</h1><p className="mt-2 text-sm text-gray-500">Selesaikan tahapan secara berurutan. Nilai hanya dapat dilihat oleh dosen.</p></div>
    <div className="space-y-5">
      <section className={`rounded-2xl border bg-white p-5 shadow-sm ${pretestDone ? "border-green-200" : "border-blue-200"}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ClipboardCheck size={20} /></span><div><h2 className="font-semibold text-gray-900">Pretest</h2><p className="mt-1 text-sm text-gray-500">Wajib dikerjakan satu kali sebelum membuka ujian per bab.</p><p className={`mt-2 text-xs font-bold ${pretestDone ? "text-green-700" : "text-amber-700"}`}>{pretestDone ? "Selesai — nilai tersimpan untuk dosen" : "Belum dikerjakan"}</p></div></div>{!pretestDone && <button onClick={() => navigate(`/mahasiswa/modul/${id}/ujian/pretest`, { state: { modulNama: modul.nama_domain } })} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Mulai Pretest <ArrowRight size={15} /></button>}</div></section>
      <section className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${pretestDone ? "border-gray-100" : "border-gray-100 opacity-65"}`}><div className="border-b border-gray-100 p-5"><h2 className="font-semibold text-gray-900">Latihan Per Bab</h2><p className="mt-1 text-sm text-gray-500">Latihan dapat diulang. Bab berikutnya terbuka setelah nilai bab sebelumnya mencapai batas lulus.</p></div><div className="divide-y divide-gray-100">{modul.bab.map((bab) => { const progress = progressMap[bab.id] || {}; const done = ["lanjut", "pengayaan"].includes(progress.status); const graded = ["lanjut", "pengayaan", "remedial"].includes(progress.status); const waiting = progress.status === "menunggu_penilaian"; const locked = !pretestDone || progress.locked; return <div key={bab.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? "bg-green-50 text-green-700" : locked ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-700"}`}>{done ? <CheckCircle2 size={18} /> : locked ? <LockKeyhole size={18} /> : <BookOpen size={18} />}</span><div><p className="text-xs font-bold text-blue-700">Bab {bab.nomor}</p><h3 className="text-sm font-semibold text-gray-900">{bab.nama}</h3><p className="mt-1 text-xs text-gray-400">{progress.status === "pengayaan" ? "Selesai · ada catatan penguatan" : done ? "Selesai" : waiting ? "Menunggu penilaian dosen" : progress.status === "remedial" ? "Perlu remedial" : locked ? "Terkunci" : "Siap dikerjakan"}</p></div></div><div className="flex gap-2">{graded && <button onClick={() => navigate(`/mahasiswa/bab/${bab.id}/hasil`, { state: { modulId: modul.id, modulNama: modul.nama_domain, babNama: bab.nama } })} className="flex items-center justify-center rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700">Lihat Analisis</button>}{!done && !locked && !waiting && <button onClick={() => navigate(`/mahasiswa/bab/${bab.id}`, { state: { modulId: modul.id, modulNama: modul.nama_domain, babNama: bab.nama } })} className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-700">{progress.status === "remedial" ? "Ulangi" : "Kerjakan"} <ArrowRight size={14} /></button>}</div></div> })}</div></section>
      <section className={`rounded-2xl border bg-white p-5 shadow-sm ${semuaBabDone ? "border-blue-200" : "border-gray-100 opacity-65"}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${semuaBabDone ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"}`}>{semuaBabDone ? <ClipboardCheck size={20} /> : <LockKeyhole size={20} />}</span><div><h2 className="font-semibold text-gray-900">Posttest</h2><p className="mt-1 text-sm text-gray-500">Menggunakan paket soal yang sama dengan pretest dan hanya dapat dikerjakan satu kali.</p><p className="mt-2 text-xs font-bold text-gray-500">{posttestDone ? "Selesai — nilai tersimpan untuk dosen" : semuaBabDone ? "Siap dikerjakan" : "Selesaikan seluruh bab terlebih dahulu"}</p></div></div>{semuaBabDone && !posttestDone && <button onClick={() => navigate(`/mahasiswa/modul/${id}/ujian/posttest`, { state: { modulNama: modul.nama_domain } })} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Mulai Posttest <ArrowRight size={15} /></button>}</div></section>
    </div>
  </DashboardLayout>
}

export default ModulUjianDetail
