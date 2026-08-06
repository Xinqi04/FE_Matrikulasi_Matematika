import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, PenLine, PlayCircle, Sparkles, Target, Youtube } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getHasilBab } from "../../api"

const STATUS_META = {
  remedial: { label: "Perlu Remedial", color: "from-red-500 to-orange-500" },
  pengayaan: { label: "Perlu Pengayaan", color: "from-amber-500 to-yellow-500" },
  lanjut: { label: "Lulus", color: "from-green-500 to-emerald-500" },
  belum_ada_nilai: { label: "Belum Ada Nilai", color: "from-gray-400 to-gray-500" },
}

const ScoreGauge = ({ value, size = 128 }) => {
  const stroke = 11
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, value)) / 100
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} stroke="white" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none">{value}</span>
        <span className="text-[10px] font-bold text-white/70 mt-1">/ 100</span>
      </div>
    </div>
  )
}

const HasilBab = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const modulId = location.state?.modulId
  const [hasil, setHasil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [brokenThumbs, setBrokenThumbs] = useState({})

  useEffect(() => {
    getHasilBab(id).then(setHasil).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const meta = STATUS_META[hasil?.status] || STATUS_META.belum_ada_nilai
  const bisaKerjakanUlang = hasil?.status === "remedial" || hasil?.status === "pengayaan"
  const konsepUrut = hasil ? Object.entries(hasil.nilai_per_konsep).sort((a, b) => a[1] - b[1]) : []

  return (
    <DashboardLayout role="mahasiswa">
      <button
        onClick={() => navigate(modulId ? `/mahasiswa/ujian/${modulId}` : "/mahasiswa/ujian")}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Bab
      </button>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat hasil...</div>
      ) : !hasil || hasil.status === "belum_ada_nilai" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Belum ada nilai untuk bab ini.</div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${meta.color} rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6`}
          >
            <ScoreGauge value={hasil.nilai_bab} />
            <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 w-full">
              <div className="text-center sm:text-left">
                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Status Capaian</p>
                <h1 className="text-2xl md:text-3xl font-black">{meta.label}</h1>
              </div>
              {bisaKerjakanUlang && (
                <button
                  onClick={() => navigate(`/mahasiswa/bab/${id}`, { state: { modulId } })}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0"
                >
                  <PenLine size={16} /> Kerjakan Ulang
                </button>
              )}
            </div>
          </motion.div>

          {konsepUrut.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="font-bold text-gray-800 mb-4">Nilai per Konsep</h2>
              <div className="space-y-2.5">
                {konsepUrut.map(([konsep, nilai]) => {
                  const lemah = nilai < 70
                  return (
                    <div key={konsep} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-40 shrink-0 truncate" title={konsep}>{konsep}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(nilai, 100)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${lemah ? "bg-red-500" : "bg-green-500"}`}
                        />
                      </div>
                      <span className={`text-sm font-black w-9 text-right shrink-0 ${lemah ? "text-red-600" : "text-green-600"}`}>
                        {nilai}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {bisaKerjakanUlang && hasil.konsep_fokus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-3"
            >
              <Target size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-800 mb-2">Fokus belajar konsep-konsep ini</p>
                <div className="flex flex-wrap gap-1.5">
                  {hasil.konsep_fokus.map((k) => <Badge key={k} variant="orange">{k}</Badge>)}
                </div>
              </div>
            </motion.div>
          )}

          {hasil.status === "lanjut" && hasil.konsep_fokus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3"
            >
              <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-800 mb-2">Bersiap untuk Bab berikutnya</p>
                <div className="flex flex-wrap gap-1.5">
                  {hasil.konsep_fokus.map((k) => <Badge key={k} variant="blue">{k}</Badge>)}
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-800">Rekomendasi Video</h2>
            </div>

            {hasil.rekomendasi_video.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Belum ada rekomendasi video.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hasil.rekomendasi_video.map((v, idx) => (
                  <motion.a
                    key={v.video_id}
                    href={v.link}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all block"
                  >
                    <div className="relative aspect-video bg-slate-100">
                      {brokenThumbs[v.video_id] ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Youtube size={32} />
                        </div>
                      ) : (
                        <img
                          src={v.thumbnail || `https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() => setBrokenThumbs((prev) => ({ ...prev, [v.video_id]: true }))}
                        />
                      )}
                      <span className="absolute top-2 right-2">
                        <Badge variant="blue">{Math.round(v.jaccard * 100)}% cocok</Badge>
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{v.judul}</p>
                      <p className="text-xs text-gray-400 mb-3">{v.channel || "-"}</p>
                      <div className="flex flex-wrap gap-1">
                        {v.konsep_cocok.map((k) => <Badge key={k} variant="green">{k}</Badge>)}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default HasilBab
