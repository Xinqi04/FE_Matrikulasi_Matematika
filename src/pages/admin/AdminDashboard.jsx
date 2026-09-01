import { useEffect, useState } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getAdminDashboard, listUsers } from "../../api"

const roleMeta = {
  mahasiswa: { label: "Mahasiswa", badge: "purple" },
  dosen: { label: "Dosen", badge: "blue" },
  admin: { label: "Admin", badge: "green" },
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([listUsers(), getAdminDashboard()])
      .then(([userRows, dashboard]) => { setUsers(userRows); setSummary(dashboard) })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <DashboardLayout role="admin" title="Dashboard Admin" subtitle="Daftar seluruh akun yang terdaftar di sistem matrikulasi.">
      {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

      {summary && <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[['Admin', summary.jumlah_admin], ['Dosen', summary.jumlah_dosen], ['Mahasiswa', summary.jumlah_mahasiswa], ['Akun Aktif', summary.jumlah_aktif]].map(([label, value]) =>
          <article key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-gray-900">{value}</p></article>
        )}
      </section>}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="font-semibold">Daftar Akun</h2>
            <p className="mt-1 text-sm text-gray-400">Admin, dosen, dan mahasiswa.</p>
          </div>
          <span className="text-sm font-semibold text-blue-700">{users.length} pengguna</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="p-4 text-left">Nama</th>
                <th className="p-4 text-left">NIM / ID</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/40">
                  <td className="p-4 font-semibold">{user.nama}</td>
                  <td className="p-4 text-gray-500">{user.nim}</td>
                  <td className="p-4"><Badge variant={roleMeta[user.role]?.badge}>{roleMeta[user.role]?.label || user.role}</Badge></td>
                  <td className="p-4 text-center"><Badge variant={user.aktif ? "green" : "red"}>{user.aktif ? "Aktif" : "Nonaktif"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!users.length && !error && <p className="p-8 text-center text-gray-400">Belum ada akun.</p>}
      </section>
    </DashboardLayout>
  )
}
