import { useEffect, useMemo, useState } from "react"
import { motion as Motion } from "framer-motion"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { beriNilaiBatch, beriNilaiUjianModulBatch, getModul, getPenilaian, getPenilaianUjianModul } from "../../api"

const isDraftValid = (value) => value !== undefined && value !== "" && !Number.isNaN(Number(value))
const oldestFirst = (a, b) => String(a.dijawab_pada || "").localeCompare(String(b.dijawab_pada || ""))

const Penilaian = () => {
  const [modul, setModul] = useState([])
  const [jawabanBab, setJawabanBab] = useState([])
  const [jawabanModul, setJawabanModul] = useState([])
  const [modulId, setModulId] = useState("")
  const [jenis, setJenis] = useState("")
  const [babId, setBabId] = useState("")
  const [status, setStatus] = useState("menunggu_penilaian")
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState({})
  const [expanded, setExpanded] = useState({})
  const [warning, setWarning] = useState("")

  const load = () => {
    setLoading(true)
    Promise.all([
      getPenilaian(),
      getPenilaianUjianModul(),
    ]).then(([bab, ujianModul]) => {
      setJawabanBab(bab)
      setJawabanModul(ujianModul)
    }).catch((err) => setWarning(err.message)).finally(() => setLoading(false))
  }

  useEffect(() => { getModul().then(setModul).catch((err) => setWarning(err.message)) }, [])
  useEffect(load, [])

  const babMeta = useMemo(() => {
    const map = {}
    for (const item of modul) for (const bab of item.bab) map[bab.id] = { ...bab, modul_id: item.id, modul_nama: item.nama_domain }
    return map
  }, [modul])

  const semuaJawaban = useMemo(() => [
    ...jawabanBab.map((item) => ({ ...item, sumber: "bab", modul_id: babMeta[item.bab_id]?.modul_id, modul_nama: babMeta[item.bab_id]?.modul_nama })),
    ...jawabanModul.map((item) => ({ ...item, sumber: item.jenis })),
  ].sort(oldestFirst), [jawabanBab, jawabanModul, babMeta])

  const babOptions = useMemo(() => modul.find((item) => item.id === modulId)?.bab || [], [modul, modulId])

  const filtered = useMemo(() => semuaJawaban.filter((item) =>
    item.modul_id === modulId && item.sumber === jenis &&
    (!status || item.status === status) && (jenis !== "bab" || !babId || item.bab_id === babId)
  ), [semuaJawaban, modulId, jenis, babId, status])

  const groups = useMemo(() => {
    const map = new Map()
    for (const item of filtered) {
      const key = item.sumber === "bab" ? `${item.bab_id}:${item.mahasiswa_id}` : item.attempt_id
      if (!map.has(key)) map.set(key, { key, source: item.sumber, items: [], firstAt: item.dijawab_pada })
      map.get(key).items.push(item)
    }
    return [...map.values()].sort((a, b) => String(a.firstAt || "").localeCompare(String(b.firstAt || "")))
  }, [filtered])

  const selectModul = (value) => { setModulId(value); setJenis(""); setBabId("") }
  const selectJenis = (value) => { setJenis(value); setBabId("") }

  const saveGroup = async (group) => {
    const payload = group.items.filter((item) => item.status !== "dinilai" && isDraftValid(drafts[item.id]))
      .map((item) => ({ jawaban_id: item.id, nilai: Number(drafts[item.id]) }))
    if (!payload.length) return
    setSaving((current) => ({ ...current, [group.key]: true })); setWarning("")
    try {
      await (group.source === "bab" ? beriNilaiBatch(payload) : beriNilaiUjianModulBatch(payload))
      load()
    } catch (err) { setWarning(err.message) }
    finally { setSaving((current) => ({ ...current, [group.key]: false })) }
  }

  return <DashboardLayout role="dosen" title="Penilaian Jawaban" subtitle="Pilih modul dan jenis ujian. Mahasiswa yang mengumpulkan ditampilkan dari yang paling lama.">
    <section className="mb-6 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
      <Filter label="1. Modul" value={modulId} onChange={selectModul}>
        <option value="">Pilih modul</option>{modul.map((item) => <option key={item.id} value={item.id}>{item.nama_domain}</option>)}
      </Filter>
      <Filter label="2. Jenis Ujian" value={jenis} onChange={selectJenis} disabled={!modulId}>
        <option value="">Pilih jenis</option><option value="pretest">Pretest</option><option value="posttest">Posttest</option><option value="bab">Ujian Bab Biasa</option>
      </Filter>
      <Filter label="3. Bab" value={babId} onChange={setBabId} disabled={jenis !== "bab"}>
        <option value="">Semua bab</option>{babOptions.map((item) => <option key={item.id} value={item.id}>Bab {item.nomor}. {item.nama}</option>)}
      </Filter>
      <Filter label="Status" value={status} onChange={setStatus}>
        <option value="menunggu_penilaian">Menunggu</option><option value="dinilai">Sudah dinilai</option><option value="">Semua status</option>
      </Filter>
    </section>

    {warning && <div className="mb-6 flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700"><AlertTriangle size={16}/>{warning}</div>}

    {modulId && jenis && <div className="mb-4"><h2 className="font-semibold text-gray-900">Mahasiswa yang Mengumpulkan</h2><p className="mt-1 text-sm text-gray-400">Urutan pengumpulan paling lama ditampilkan lebih dahulu.</p></div>}
    <div className="space-y-4">
      {loading ? <Empty text="Memuat jawaban..." /> : !modulId ? <Empty text="Pilih modul yang akan dinilai." /> : !jenis ? <Empty text="Pilih pretest, posttest, atau ujian bab biasa." /> : !groups.length ? <Empty text="Belum ada mahasiswa yang mengumpulkan sesuai filter." /> : groups.map((group, index) => {
        const first = group.items[0]
        const pending = group.items.filter((item) => item.status !== "dinilai")
        const allFilled = pending.length > 0 && pending.every((item) => isDraftValid(drafts[item.id]))
        const title = group.source === "bab" ? `Bab ${babMeta[first.bab_id]?.nomor}. ${babMeta[first.bab_id]?.nama}` : first.jenis
        const isOpen = Boolean(expanded[group.key])
        const graded = group.items.filter((item) => item.status === "dinilai" && item.nilai !== null && item.nilai !== undefined)
        const nilaiAkumulasi = graded.length === group.items.length ? Math.round((graded.reduce((total, item) => total + Number(item.nilai), 0) / graded.length) * 100) / 100 : null
        return <Motion.article key={group.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .03 }} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <header className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${isOpen ? "mb-4 border-b border-gray-100 pb-4" : ""}`}><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-gray-900">{first.mahasiswa_nama}</p><span className="text-xs text-gray-400">{first.mahasiswa_nim}</span>{first.percobaan > 1 && <Badge variant="red">Remedial · Percobaan {first.percobaan}</Badge>}{pending.length ? <Badge variant="orange">Menunggu dinilai</Badge> : <Badge variant="green">Nilai {nilaiAkumulasi ?? "-"}</Badge>}</div><p className="mt-1 text-xs capitalize text-gray-400">{title} · {group.items.length} soal · {first.dijawab_pada ? new Date(first.dijawab_pada).toLocaleString("id-ID") : "Waktu tidak tersedia"}</p></div><div className="flex gap-2"><button onClick={() => setExpanded((current) => ({ ...current, [group.key]: !isOpen }))} className="rounded-xl border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">{isOpen ? "Tutup Detail" : "Lihat Detail"}</button>{isOpen && pending.length > 0 && <button onClick={() => saveGroup(group)} disabled={!allFilled || saving[group.key]} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">{saving[group.key] ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}Simpan Nilai</button>}</div></header>
          {isOpen && <div className="space-y-4">{group.items.map((item) => <div key={item.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0"><div className="mb-2 flex gap-2"><Badge variant={item.tipe === "esai" ? "purple" : "blue"}>{item.tipe.replace("_", " ")}</Badge><Badge variant={item.status === "dinilai" ? "green" : "orange"}>{item.status.replace("_", " ")}</Badge></div><p className="mb-2 text-sm font-medium text-gray-800">{item.teks_soal}</p>{item.jawaban_referensi && <p className="mb-2 text-xs text-gray-400">Referensi: {item.jawaban_referensi}</p>}<div className="mb-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{item.teks_jawaban}</div>{item.status === "dinilai" ? <p className="font-bold text-blue-700">Nilai: {item.nilai}</p> : <input type="number" min="0" max="100" value={drafts[item.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Nilai 0–100" className="w-32 rounded-xl border-2 border-gray-100 bg-gray-50 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"/>}</div>)}</div>}
        </Motion.article>
      })}
    </div>
  </DashboardLayout>
}

const Filter = ({ label, value, onChange, disabled, children }) => <label><span className="ml-1 text-xs font-black uppercase tracking-wider text-gray-400">{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 py-3 text-sm font-medium outline-none disabled:opacity-50">{children}</select></label>
const Empty = ({ text }) => <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400">{text}</div>

export default Penilaian
