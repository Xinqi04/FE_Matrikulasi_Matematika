import { useEffect, useState } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { listMahasiswa } from "../../api"

const ManageMahasiswa = () => {
  const [mahasiswa, setMahasiswa] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    listMahasiswa().then(setMahasiswa).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="dosen" title="Mahasiswa Terdaftar" subtitle="Mahasiswa yang telah di-enroll ke modul oleh admin.">
      {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-gray-50/50"><tr><th className="p-4 text-left">Nama</th><th className="p-4 text-left">NIM / ID</th><th className="p-4 text-center">Jumlah Modul</th><th className="p-4 text-center">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={4} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                : mahasiswa.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada mahasiswa yang di-enroll.</td></tr>
                : mahasiswa.map((item) => <tr key={item.id} className="hover:bg-gray-50/50"><td className="p-4 font-medium">{item.nama}</td><td className="p-4 text-gray-500">{item.nim}</td><td className="p-4 text-center text-gray-500">{item.jumlah_modul ?? item.modul_ids?.length ?? "-"}</td><td className="p-4 text-center"><Badge variant={item.aktif ? "green" : "red"}>{item.aktif ? "Aktif" : "Nonaktif"}</Badge></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageMahasiswa
