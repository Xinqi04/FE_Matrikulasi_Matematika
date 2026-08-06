import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Rocket, PartyPopper, ChevronRight } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { getMahasiswaDashboard } from "../../api"

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [modul, setModul] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMahasiswaDashboard()
      .then((data) => {
        setModul(data.modul)
        const map = {}
        data.progress.forEach((p) => { map[p.bab_id] = p })
        setProgressMap(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const semuaBab = modul.flatMap((m) => m.bab.map((bab) => ({ ...bab, modulNama: m.nama_domain })))
  const totalBab = semuaBab.length
  const babLulus = semuaBab.filter((bab) => progressMap[bab.id]?.status === "lanjut").length
  const babLanjut = semuaBab.find((bab) => !progressMap[bab.id]?.locked && progressMap[bab.id]?.status !== "lanjut")
  const semuaSelesai = totalBab > 0 && babLulus === totalBab

  return (
    <DashboardLayout role="mahasiswa" title="Materi & Progres Belajar" subtitle="Kerjakan soal tiap Bab dan pantau capaianmu.">
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat data...</div>
      ) : modul.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Belum ada modul tersedia.</div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-md shadow-blue-100 p-6 text-white"
          >
            <div className="flex items-center gap-2 mb-1 text-blue-100">
              <BookOpen size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Sedang Dikerjakan</span>
            </div>
            <h2 className="text-xl font-black mb-3">{babLanjut?.modulNama || semuaBab[0]?.modulNama || "Matrikulasi"}</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-blue-100">{babLulus} dari {totalBab} Bab lulus</p>
                <div className="w-48 h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${totalBab ? (babLulus / totalBab) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {semuaSelesai ? (
                <span className="flex items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl text-sm font-bold">
                  <PartyPopper size={16} /> Semua Bab Lulus!
                </span>
              ) : babLanjut && (
                <button
                  onClick={() => navigate(`/mahasiswa/bab/${babLanjut.id}`)}
                  className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shrink-0"
                >
                  <Rocket size={16} /> Lanjutkan Bab {babLanjut.nomor}
                </button>
              )}
            </div>
          </motion.div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-800">Modul</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modul.map((m, idx) => {
                const babLulusModul = m.bab.filter((bab) => progressMap[bab.id]?.status === "lanjut").length
                const totalBabModul = m.bab.length
                const selesai = totalBabModul > 0 && babLulusModul === totalBabModul
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => navigate(`/mahasiswa/ujian/${m.id}`)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md hover:border-blue-100 transition-all flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{m.nama_domain}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${totalBabModul ? (babLulusModul / totalBabModul) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 shrink-0">{babLulusModul} / {totalBabModul} Bab lulus</p>
                      </div>
                    </div>
                    {selesai ? (
                      <PartyPopper size={18} className="text-amber-500 shrink-0" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-300 shrink-0" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default StudentDashboard
