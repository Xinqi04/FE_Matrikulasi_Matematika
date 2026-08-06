import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, ChevronRight, PartyPopper } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import { getMahasiswaDashboard } from "../../api"

const UjianModul = () => {
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

  return (
    <DashboardLayout role="mahasiswa" title="Ujian" subtitle="Pilih modul untuk melihat daftar Bab yang bisa dikerjakan.">
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat data...</div>
      ) : modul.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Belum ada modul tersedia.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modul.map((m, idx) => {
            const babLulus = m.bab.filter((bab) => progressMap[bab.id]?.status === "lanjut").length
            const totalBab = m.bab.length
            const selesai = totalBab > 0 && babLulus === totalBab

            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => navigate(`/mahasiswa/ujian/${m.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-blue-100 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <BookOpen size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{m.nama_domain}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${totalBab ? (babLulus / totalBab) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{babLulus} / {totalBab} Bab lulus</p>
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
      )}
    </DashboardLayout>
  )
}

export default UjianModul
