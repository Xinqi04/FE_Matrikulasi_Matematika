import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { Check, Loader2, AlertTriangle } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import { getModul, getPenilaian, beriNilaiBatch, getPenilaianUjianModul, beriNilaiUjianModulBatch } from "../../api"

const isDraftValid = (value) => value !== undefined && value !== "" && !Number.isNaN(parseFloat(value))

const Penilaian = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const babFilter = searchParams.get("bab_id") || ""

  const [modul, setModul] = useState([])
  const [statusFilter, setStatusFilter] = useState("menunggu_penilaian")
  const [mode, setMode] = useState("bab")
  const [jawaban, setJawaban] = useState([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState({})
  const [warning, setWarning] = useState("")

  useEffect(() => {
    getModul().then(setModul).catch(console.error)
  }, [])

  const babOptions = useMemo(() => {
    const opts = []
    for (const m of modul) {
      for (const bab of m.bab) {
        opts.push({ id: bab.id, label: `${m.nama_domain} — Bab ${bab.nomor}. ${bab.nama}` })
      }
    }
    return opts
  }, [modul])

  const babLabelMap = useMemo(() => {
    const map = {}
    for (const m of modul) {
      for (const bab of m.bab) {
        map[bab.id] = `Bab ${bab.nomor}. ${bab.nama}`
      }
    }
    return map
  }, [modul])

  const load = () => {
    setLoading(true)
    const request = mode === "modul" ? getPenilaianUjianModul(statusFilter || undefined) : getPenilaian(babFilter || undefined, statusFilter || undefined)
    request
      .then(setJawaban)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const request = mode === "modul" ? getPenilaianUjianModul(statusFilter || undefined) : getPenilaian(babFilter || undefined, statusFilter || undefined)
    request.then(setJawaban).catch(console.error).finally(() => setLoading(false))
  }, [babFilter, statusFilter, mode])

  const groups = useMemo(() => {
    const map = new Map()
    for (const j of jawaban) {
      const key = mode === "modul" ? j.attempt_id : `${j.bab_id}:${j.mahasiswa_id}`
      if (!map.has(key)) {
        map.set(key, { key, bab_id: j.bab_id, mahasiswa_id: j.mahasiswa_id, mahasiswa_nama: j.mahasiswa_nama, modul_nama: j.modul_nama, jenis: j.jenis, items: [] })
      }
      map.get(key).items.push(j)
    }
    return Array.from(map.values())
  }, [jawaban, mode])

  const handleSaveGroup = async (group) => {
    const ungraded = group.items.filter((i) => i.status !== "dinilai")
    const payload = ungraded
      .filter((i) => isDraftValid(drafts[i.id]))
      .map((i) => ({ jawaban_id: i.id, nilai: parseFloat(drafts[i.id]) }))
    if (payload.length === 0) return

    setSaving((prev) => ({ ...prev, [group.key]: true }))
    setWarning("")
    try {
      const res = await (mode === "modul" ? beriNilaiUjianModulBatch(payload) : beriNilaiBatch(payload))
      if ((res.jawaban || []).length < payload.length) {
        setWarning(`${res.jawaban.length} dari ${payload.length} nilai tersimpan — beberapa jawaban mungkin sudah berubah, silakan cek ulang.`)
      }
      load()
    } finally {
      setSaving((prev) => ({ ...prev, [group.key]: false }))
    }
  }

  return (
    <DashboardLayout role="dosen" title="Penilaian Jawaban" subtitle="Nilai ujian per bab, pretest, dan posttest mahasiswa.">
      <div className="mb-5 flex gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        <button type="button" onClick={() => setMode("bab")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${mode === "bab" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Ujian Per Bab</button>
        <button type="button" onClick={() => setMode("modul")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${mode === "modul" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Pretest & Posttest</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {mode === "bab" && <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bab</label>
          <select
            value={babFilter}
            onChange={(e) => setSearchParams(e.target.value ? { bab_id: e.target.value } : {})}
            className="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-700"
          >
            <option value="">Semua Bab</option>
            {babOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-700"
          >
            <option value="menunggu_penilaian">Menunggu Penilaian</option>
            <option value="dinilai">Sudah Dinilai</option>
            <option value="">Semua Status</option>
          </select>
        </div>
      </div>

      {warning && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium rounded-2xl p-4 mb-6">
          <AlertTriangle size={16} className="shrink-0" />
          {warning}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat data...</div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Tidak ada jawaban ditemukan.</div>
        ) : groups.map((group, gIdx) => {
          const ungraded = group.items.filter((i) => i.status !== "dinilai")
          const allFilled = ungraded.length > 0 && ungraded.every((i) => isDraftValid(drafts[i.id]))

          return (
            <Motion.div
              key={group.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.03 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="font-bold text-sm text-gray-900">{group.mahasiswa_nama}</p>
                  <p className="text-xs text-gray-400">{mode === "modul" ? `${group.modul_nama} — ${group.jenis}` : babLabelMap[group.bab_id] || "Bab"}</p>
                </div>
                {ungraded.length > 0 && (
                  <button
                    onClick={() => handleSaveGroup(group)}
                    disabled={saving[group.key] || !allFilled}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 shrink-0"
                  >
                    {saving[group.key] ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Simpan Semua Nilai
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {group.items.map((j) => (
                  <div key={j.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={j.tipe === "esai" ? "purple" : "blue"}>{j.tipe.replace("_", " ")}</Badge>
                        <Badge variant={j.status === "dinilai" ? "green" : "orange"}>{j.status.replace("_", " ")}</Badge>
                      </div>
                      {j.nilai !== null && j.nilai !== undefined && (
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-gray-900">{j.nilai}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Nilai</p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 font-medium mb-2">{j.teks_soal}</p>
                    {j.jawaban_referensi && (
                      <p className="text-xs text-gray-400 mb-2">Referensi: {j.jawaban_referensi}</p>
                    )}
                    <div className="bg-gray-50/60 rounded-xl p-3 text-sm text-gray-700 mb-2">
                      {j.teks_jawaban}
                    </div>

                    {j.status !== "dinilai" && (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        value={drafts[j.id] ?? ""}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [j.id]: e.target.value }))}
                        className="w-28 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 text-sm font-bold text-slate-700"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Motion.div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}

export default Penilaian
