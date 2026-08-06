import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Users, BookOpen, FileQuestion, ClipboardCheck, ArrowRight } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import StatCard from "../../components/StatCard"
import { getDosenDashboard, getPenilaian } from "../../api"

const DosenDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDosenDashboard(), getPenilaian(null, "menunggu_penilaian")])
      .then(([dashboard, penilaian]) => {
        setStats(dashboard)
        setPending(penilaian)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="dosen" title="Dashboard Overview" subtitle="Pantau progres materi, soal, dan penilaian mahasiswa.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Mahasiswa Aktif"
          value={loading ? "-" : stats?.jumlah_mahasiswa_aktif ?? 0}
          icon={<Users className="text-blue-600" size={20} />}
          color="bg-blue-50"
        />
        <StatCard
          title="Modul"
          value={loading ? "-" : stats?.jumlah_modul ?? 0}
          icon={<BookOpen className="text-indigo-600" size={20} />}
          color="bg-indigo-50"
        />
        <StatCard
          title="Total Soal"
          value={loading ? "-" : stats?.jumlah_soal ?? 0}
          icon={<FileQuestion className="text-purple-600" size={20} />}
          color="bg-purple-50"
        />
        <StatCard
          title="Perlu Dinilai"
          value={loading ? "-" : stats?.jumlah_jawaban_menunggu_penilaian ?? 0}
          icon={<ClipboardCheck className="text-orange-600" size={20} />}
          color="bg-orange-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Jawaban Menunggu Penilaian</h2>
          <button
            onClick={() => navigate("/dosen/penilaian")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Lihat semua <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {!loading && pending.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400 font-medium">Semua jawaban sudah dinilai.</p>
            </div>
          )}

          {pending.slice(0, 6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.mahasiswa_nama}</p>
                <p className="text-[12px] text-gray-500 truncate">{item.teks_soal}</p>
              </div>
              <button
                onClick={() => navigate(`/dosen/penilaian?bab_id=${item.bab_id}`)}
                className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                Nilai
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DosenDashboard
