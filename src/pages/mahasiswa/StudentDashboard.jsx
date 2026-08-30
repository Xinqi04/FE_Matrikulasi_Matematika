import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Circle, GraduationCap, LockKeyhole, Rocket, Star } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { getMahasiswaDashboard } from "../../api"

const ujianSelesai = (status) => ["menunggu_penilaian", "dinilai"].includes(status)
const babSelesai = (status) => ["lanjut", "pengayaan"].includes(status)

const StudentDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let active = true
    getMahasiswaDashboard().then((value) => active && setData(value)).catch((err) => active && setError(err.message))
    return () => { active = false }
  }, [])

  const progressMap = useMemo(() => Object.fromEntries((data?.progress || []).map((item) => [item.bab_id, item])), [data])
  const ujianMap = useMemo(() => Object.fromEntries((data?.ujian_modul || []).map((item) => [item.modul_id, item])), [data])
  const semuaBab = (data?.modul || []).flatMap((modul) => modul.bab.map((bab) => ({ ...bab, modulId: modul.id, modulNama: modul.nama_domain })))
  const babLulus = semuaBab.filter((bab) => babSelesai(progressMap[bab.id]?.status))
  const nilai = semuaBab.map((bab) => progressMap[bab.id]?.nilai_bab).filter((item) => item != null)
  const rataRata = nilai.length ? Math.round(nilai.reduce((total, item) => total + item, 0) / nilai.length) : 0
  const modulAktif = (data?.modul || []).find((modul) => ujianSelesai(ujianMap[modul.id]?.pretest) && modul.bab.some((bab) => !babSelesai(progressMap[bab.id]?.status))) || data?.modul?.[0]
  const babAktif = modulAktif?.bab.find((bab) => !progressMap[bab.id]?.locked && !babSelesai(progressMap[bab.id]?.status))
  const progressModul = modulAktif?.bab.filter((bab) => babSelesai(progressMap[bab.id]?.status)).length || 0
  const totalModul = modulAktif?.bab.length || 0
  const persen = totalModul ? Math.round((progressModul / totalModul) * 100) : 0
  const pretestDone = ujianSelesai(ujianMap[modulAktif?.id]?.pretest)
  const babTampil = showAll ? modulAktif?.bab : modulAktif?.bab.slice(0, 3)

  const lanjutkan = () => {
    if (!modulAktif) return
    if (!pretestDone) navigate(`/mahasiswa/modul/${modulAktif.id}`)
    else if (babAktif) navigate(`/mahasiswa/bab/${babAktif.id}`, { state: { modulId: modulAktif.id, modulNama: modulAktif.nama_domain, babNama: babAktif.nama } })
    else navigate(`/mahasiswa/modul/${modulAktif.id}`)
  }

  return <DashboardLayout role="mahasiswa">
    <div className="mb-7">
      <p className="text-sm font-bold text-blue-600">Selamat datang, {user.nama?.split(" ")[0] || "Mahasiswa"}! <span aria-hidden="true">👋</span></p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">Materi &amp; Progres Belajar</h1>
      <p className="mt-2 text-sm text-gray-500">Kerjakan soal setiap bab dan pantau capaianmu.</p>
    </div>

    {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">{error}</div> : !data ? (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">Memuat progres belajar...</div>
    ) : !modulAktif ? (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">Belum ada modul tersedia.</div>
    ) : <div className="space-y-5">
      <Motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 to-blue-700 p-6 text-white shadow-lg shadow-blue-900/10">
        <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-100"><BookOpen size={15} /> Sedang dikerjakan</p>
            <h2 className="mt-2 text-xl font-semibold">{modulAktif.nama_domain}</h2>
            <p className="mt-4 text-xs text-blue-100">{progressModul} dari {totalModul} bab lulus</p>
            <div className="mt-2 h-2 w-56 max-w-full overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${persen}%` }} /></div>
          </div>
          <button onClick={lanjutkan} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"><Rocket size={17} /> {pretestDone ? "Lanjutkan Belajar" : "Mulai Pretest"}</button>
        </div>
      </Motion.section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: <BookOpen size={19} />, color: "text-green-600 bg-green-50", label: "Modul Aktif", value: data.modul.length, note: modulAktif.nama_domain },
          { icon: <Circle size={19} />, color: "text-violet-600 bg-violet-50", label: "Bab Lulus", value: `${babLulus.length} / ${semuaBab.length}`, note: `${semuaBab.length - babLulus.length} bab tersisa` },
          { icon: <Star size={19} />, color: "text-amber-500 bg-amber-50", label: "Skor Rata-rata", value: rataRata || "—", note: nilai.length ? "Dari bab yang dinilai" : "Belum ada nilai" },
          { icon: <GraduationCap size={19} />, color: "text-blue-600 bg-blue-50", label: "Progres Modul", value: `${persen}%`, note: pretestDone ? "Pretest sudah dikirim" : "Pretest belum dikerjakan" },
        ].map(({ icon, color, label, value, note }) => <article key={label} className="flex min-h-28 items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>{icon}</span>
          <div className="min-w-0"><p className="text-[11px] font-semibold text-gray-500">{label}</p><p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p><p className="truncate text-[10px] text-gray-400">{note}</p></div>
        </article>)}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5"><h2 className="font-semibold text-gray-900">Modul Aktif</h2></div>
        <button onClick={() => navigate(`/mahasiswa/modul/${modulAktif.id}`)} className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-gray-50">
          <span className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-100 text-blue-700"><BookOpen size={30} /></span>
          <div className="min-w-0 flex-1"><h3 className="font-semibold text-gray-900">{modulAktif.nama_domain}</h3><p className="mt-1 text-xs leading-5 text-gray-500">Pelajari konsep dasar secara bertahap, mulai dari pretest hingga evaluasi setiap bab.</p><p className="mt-2 text-xs font-semibold text-gray-500">{progressModul} / {totalModul} bab lulus</p><div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${persen}%` }} /></div></div>
          <ChevronRight className="shrink-0 text-gray-300" size={20} />
        </button>

        <div className="border-t border-gray-100 p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Progres per Bab</h2>
          <div className="space-y-2">{babTampil.map((bab, index) => {
            const progress = progressMap[bab.id] || {}
            const done = babSelesai(progress.status)
            const locked = progress.locked
            const waiting = progress.status === "menunggu_penilaian"
            const score = progress.nilai_bab == null ? 0 : Math.round(progress.nilai_bab)
            return <button key={bab.id} disabled={locked || waiting} onClick={() => navigate(`/mahasiswa/bab/${bab.id}`, { state: { modulId: modulAktif.id, modulNama: modulAktif.nama_domain, babNama: bab.nama } })} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition enabled:hover:border-blue-200 enabled:hover:bg-blue-50/30 disabled:cursor-default">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-green-100 text-green-700" : locked ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-700"}`}>{done ? <Check size={15} /> : locked ? <LockKeyhole size={14} /> : index + 1}</span>
              <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase text-gray-700">{bab.nama}</p><p className="mt-0.5 truncate text-[10px] text-gray-400">Bab {bab.nomor} · {done ? "Selesai" : waiting ? "Menunggu penilaian" : locked ? "Selesaikan tahap sebelumnya" : "Siap dikerjakan"}</p></div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${done ? "bg-green-50 text-green-700" : waiting ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{done ? "Lulus" : waiting ? "Diproses" : locked ? "Terkunci" : "Mulai"}</span>
              <span className="hidden w-10 text-right text-xs font-semibold text-gray-500 sm:block">{score}%</span>
              <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 md:block"><div className={`h-full rounded-full ${done ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${score}%` }} /></div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          })}</div>
          {modulAktif.bab.length > 3 && <div className="mt-4 flex justify-center"><button onClick={() => setShowAll((value) => !value)} className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700">{showAll ? "Tampilkan Lebih Sedikit" : "Lihat Semua Bab"}<ChevronDown size={15} className={showAll ? "rotate-180" : ""} /></button></div>}
        </div>
      </section>

      {data.modul.length > 1 && <button onClick={() => navigate("/mahasiswa/ujian")} className="flex items-center gap-2 text-sm font-bold text-blue-700">Lihat semua modul <ArrowRight size={16} /></button>}
    </div>}
  </DashboardLayout>
}

export default StudentDashboard
