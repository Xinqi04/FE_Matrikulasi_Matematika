import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, PenLine, LineChart, CheckCircle2, AlertTriangle, Sparkles, HelpCircle, Lock, PartyPopper } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getMahasiswaDashboard } from "../../api"

const STATUS_META = {
  lanjut: { label: "Lulus", variant: "green", icon: <CheckCircle2 size={14} /> },
  pengayaan: { label: "Pengayaan", variant: "orange", icon: <Sparkles size={14} /> },
  remedial: { label: "Remedial", variant: "red", icon: <AlertTriangle size={14} /> },
  belum_ada_nilai: { label: "Belum Dinilai", variant: "gray", icon: <HelpCircle size={14} /> },
}

const UjianBab = () => {
  const { modulId } = useParams()
  const navigate = useNavigate()
  const [modul, setModul] = useState(null)
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMahasiswaDashboard()
      .then((data) => {
        setModul(data.modul.find((m) => m.id === modulId) || null)
        const map = {}
        data.progress.forEach((p) => { map[p.bab_id] = p })
        setProgressMap(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [modulId])

  const babLulus = modul ? modul.bab.filter((bab) => progressMap[bab.id]?.status === "lanjut").length : 0
  const totalBab = modul?.bab.length ?? 0
  const semuaSelesai = totalBab > 0 && babLulus === totalBab

  return (
    <DashboardLayout role="mahasiswa">
      <button
        onClick={() => navigate("/mahasiswa/ujian")}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Modul
      </button>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat data...</div>
      ) : !modul ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Modul tidak ditemukan.</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">{modul.nama_domain}</h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">{babLulus} dari {totalBab} Bab lulus</p>
              {semuaSelesai && (
                <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                  <PartyPopper size={14} /> Semua Bab Lulus!
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {modul.bab.map((bab, idx) => {
              const progress = progressMap[bab.id]
              const meta = STATUS_META[progress?.status] || STATUS_META.belum_ada_nilai
              const locked = progress?.locked ?? false
              const sudahLulus = progress?.status === "lanjut"
              return (
                <motion.div
                  key={bab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-4 ${locked ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3 md:w-72 shrink-0">
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg shrink-0">Bab {bab.nomor}</span>
                    <p className="font-bold text-sm text-gray-900">{bab.nama}</p>
                    {locked && <Lock size={14} className="text-gray-400 shrink-0" />}
                  </div>

                  <div className="flex items-center gap-3 md:flex-1">
                    <Badge variant={meta.variant}>
                      <span className="flex items-center gap-1">{meta.icon}{meta.label}</span>
                    </Badge>
                    {progress?.nilai_bab !== null && progress?.nilai_bab !== undefined && (
                      <p className="text-lg font-black text-gray-900">{progress.nilai_bab}</p>
                    )}
                  </div>

                  <div className="flex gap-2 md:w-64 shrink-0">
                    <button
                      onClick={() => navigate(`/mahasiswa/bab/${bab.id}`, { state: { modulId } })}
                      disabled={locked || sudahLulus}
                      title={
                        locked ? "Selesaikan Bab sebelumnya dengan nilai >= 70 untuk membuka bab ini."
                        : sudahLulus ? "Sudah lulus, tidak perlu dikerjakan lagi."
                        : undefined
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      {sudahLulus ? <><CheckCircle2 size={14} /> Sudah Lulus</> : <><PenLine size={14} /> Kerjakan</>}
                    </button>
                    <button
                      onClick={() => navigate(`/mahasiswa/bab/${bab.id}/hasil`, { state: { modulId } })}
                      disabled={progress?.nilai_bab === null || progress?.nilai_bab === undefined}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-40"
                    >
                      <LineChart size={14} /> Hasil
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default UjianBab
