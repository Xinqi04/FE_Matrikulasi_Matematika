import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { getMahasiswaDashboard } from "../../api"

const UjianModul = () => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => { getMahasiswaDashboard().then(setData).catch(console.error) }, [])

  return <DashboardLayout role="mahasiswa" title="Pilih Modul" subtitle="Pilih modul untuk memulai pretest, mengerjakan setiap bab, lalu menyelesaikan posttest.">
    {!data ? <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">Memuat daftar modul...</div> : data.modul.length === 0 ? <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">Belum ada modul yang tersedia.</div> : (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.modul.map((modul) => {
          const progressMap = Object.fromEntries(data.progress.map((item) => [item.bab_id, item]))
          const selesai = modul.bab.filter((bab) => ["lanjut", "pengayaan"].includes(progressMap[bab.id]?.status)).length
          const ujian = data.ujian_modul.find((item) => item.modul_id === modul.id) || {}
          const pretestSelesai = ["menunggu_penilaian", "dinilai"].includes(ujian.pretest)
          return <article key={modul.id} className="flex min-h-64 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen size={22} /></span>
            <h2 className="text-lg font-semibold text-gray-900">{modul.nama_domain}</h2><p className="mt-1 text-sm text-gray-400">{modul.bab.length} bab</p>
            <div className="mt-5 flex-1 space-y-2 text-xs"><p className={`flex items-center gap-2 ${pretestSelesai ? "text-green-700" : "text-amber-700"}`}><CheckCircle2 size={14} /> Pretest {pretestSelesai ? "selesai" : "belum dikerjakan"}</p><p className="text-gray-500">Progres bab: {selesai}/{modul.bab.length} selesai</p></div>
            <button onClick={() => navigate(`/mahasiswa/modul/${modul.id}`)} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">Buka Modul <ArrowRight size={16} /></button>
          </article>
        })}
      </div>
    )}
  </DashboardLayout>
}

export default UjianModul
