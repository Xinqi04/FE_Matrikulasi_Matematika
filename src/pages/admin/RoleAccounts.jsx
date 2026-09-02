import { useEffect, useState } from "react"
import { BookOpen, Check, Copy, Pencil, Plus, UserRoundPlus } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Modal from "../../components/Modal"
import Badge from "../../components/Badge"
import { createUser, getModul, getUserModules, listUsers, setUserModules, updateUser } from "../../api"

const labels = { mahasiswa: "Mahasiswa", dosen: "Dosen", admin: "Admin" }

export default function RoleAccounts({ role }) {
  const label = labels[role]
  const [users, setUsers] = useState([])
  const [modules, setModules] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ nama: "", nim: "", password: "" })
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)
  const [target, setTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({ nama: "", nim: "", aktif: true, password_baru: "" })
  const [selected, setSelected] = useState([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const load = () => listUsers(role).then(setUsers).catch((err) => setError(err.message))
  useEffect(() => { load(); if (role === "mahasiswa") getModul().then(setModules) }, [role])

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("")
    try {
      const result = await createUser({ ...form, role, password: form.password || null })
      setCreated(result); setForm({ nama: "", nim: "", password: "" }); load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const openEnrollment = async (user) => {
    setTarget(user)
    try { setSelected((await getUserModules(user.id)).modul_ids) }
    catch (err) { setTarget(null); setError(err.message) }
  }

  const saveEnrollment = async () => {
    setSaving(true)
    try { await setUserModules(target.id, selected); setMessage(`Enrollment ${target.nama} diperbarui.`); setTarget(null) }
    catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const closeForm = () => { setFormOpen(false); setCreated(null); setCopied(false) }

  const openEdit = (user) => {
    setEditTarget(user)
    setEditForm({ nama: user.nama, nim: user.nim, aktif: user.aktif, password_baru: "" })
    setError("")
  }

  const saveEdit = async (event) => {
    event.preventDefault(); setSaving(true); setError("")
    try {
      await updateUser(editTarget.id, { ...editForm, password_baru: editForm.password_baru || null })
      setMessage(`Akun ${editForm.nama} berhasil diperbarui${editForm.password_baru ? " dan password baru telah disimpan" : ""}.`)
      setEditTarget(null); load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return <DashboardLayout role="admin" title={`Kelola ${label}`} subtitle={`Tambah akun dan atur status ${label.toLowerCase()}.`}>
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><p className="text-sm text-gray-500">Total {label}</p><p className="mt-1 text-3xl font-bold text-gray-900">{users.length}</p></div>
      <button onClick={() => setFormOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 sm:w-auto"><Plus size={17}/> Tambah {label}</button>
    </div>
    {message && <div className="mb-4 rounded-xl bg-green-50 p-4 text-green-700">{message}</div>}
    {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-gray-50/70"><tr><th className="p-4 text-left">Nama</th><th className="p-4 text-left">NIM / ID</th>{role === "mahasiswa" && <th className="p-4 text-center">Enrollment</th>}<th className="p-4 text-center">Status</th><th className="p-4 text-center">Aksi</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{users.map((user) => <tr key={user.id} className="hover:bg-gray-50/40"><td className="p-4 font-semibold">{user.nama}</td><td className="p-4 text-gray-500">{user.nim}</td>{role === "mahasiswa" && <td className="p-4 text-center"><button onClick={() => openEnrollment(user)} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700"><BookOpen size={16}/> Atur Modul</button></td>}<td className="p-4 text-center"><Badge variant={user.aktif?"green":"red"}>{user.aktif?"Aktif":"Nonaktif"}</Badge></td><td className="p-4 text-center"><button onClick={()=>openEdit(user)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700"><Pencil size={15}/> Edit</button></td></tr>)}</tbody>
      </table>
    </div>

    <Modal open={formOpen} onClose={closeForm} title={`Tambah ${label}`}>
      {created ? <div className="space-y-4"><div className="rounded-xl bg-green-50 p-4 text-green-700">Akun <b>{created.nama}</b> berhasil dibuat.</div><div><label className="text-xs font-bold uppercase text-gray-400">Password awal</label><div className="mt-2 flex items-center rounded-xl border bg-gray-50 p-3"><code className="flex-1">{created.password_awal}</code><button onClick={()=>{navigator.clipboard.writeText(created.password_awal);setCopied(true)}}>{copied?<Check size={18}/>:<Copy size={18}/>}</button></div><p className="mt-2 text-xs text-gray-400">Simpan dan sampaikan password ini kepada pemilik akun.</p></div><button onClick={closeForm} className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white">Selesai</button></div> :
      <form onSubmit={submit} className="space-y-4"><div className="flex justify-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><UserRoundPlus/></div></div><label className="block text-sm font-semibold">Nama lengkap<input required value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder={`Nama ${label.toLowerCase()}`}/></label><label className="block text-sm font-semibold">NIM / ID<input required value={form.nim} onChange={e=>setForm({...form,nim:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label><label className="block text-sm font-semibold">Password <span className="font-normal text-gray-400">(opsional)</span><input type="password" minLength={6} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="Otomatis jika dikosongkan"/></label><button disabled={saving} className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white disabled:opacity-50">{saving?"Menyimpan...":`Simpan ${label}`}</button></form>}
    </Modal>

    <Modal open={!!editTarget} onClose={()=>setEditTarget(null)} title={`Edit ${label}`}>
      <form onSubmit={saveEdit} className="space-y-4">
        <label className="block text-sm font-semibold">Nama lengkap<input required value={editForm.nama} onChange={e=>setEditForm({...editForm,nama:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="block text-sm font-semibold">NIM / ID<input required value={editForm.nim} onChange={e=>setEditForm({...editForm,nim:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="flex items-center justify-between rounded-xl border bg-gray-50 p-4"><span><b className="block text-sm">Status akun</b><span className="text-xs text-gray-400">Akun nonaktif tidak dapat login.</span></span><input type="checkbox" checked={editForm.aktif} onChange={e=>setEditForm({...editForm,aktif:e.target.checked})} className="h-5 w-5 accent-blue-600"/></label>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4"><label className="block text-sm font-semibold text-gray-800">Reset password <span className="font-normal text-gray-400">(opsional)</span><input type="password" minLength={6} value={editForm.password_baru} onChange={e=>setEditForm({...editForm,password_baru:e.target.value})} className="mt-2 w-full rounded-xl border border-orange-100 bg-white p-3 font-normal" placeholder="Kosongkan jika password tidak diubah"/></label><p className="mt-2 text-xs leading-relaxed text-orange-700">Isi hanya ketika pengguna lupa password. Password lama langsung diganti setelah disimpan.</p></div>
        <button disabled={saving} className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white disabled:opacity-50">{saving?"Menyimpan...":"Simpan Perubahan"}</button>
      </form>
    </Modal>

    <Modal open={!!target} onClose={()=>setTarget(null)} title={`Enrollment — ${target?.nama||""}`}><div className="space-y-4">{modules.map(modul=><label key={modul.id} className="flex items-center gap-3 rounded-xl border bg-gray-50 p-3"><input type="checkbox" checked={selected.includes(modul.id)} onChange={()=>setSelected(old=>old.includes(modul.id)?old.filter(id=>id!==modul.id):[...old,modul.id])}/><span>{modul.nama_domain}</span></label>)}{modules.length===0&&<p className="py-5 text-center text-gray-400">Belum ada modul.</p>}<button onClick={saveEnrollment} disabled={saving} className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white">Simpan Enrollment</button></div></Modal>
  </DashboardLayout>
}
