import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, XCircle, X, Save, Trash2, Sparkles } from "lucide-react"
import Badge from "./Badge"
import { getJob, confirmGeneratedSoal } from "../api"

const TIPE_OPTIONS = [
  { value: "isian_singkat", label: "Isian Singkat" },
  { value: "esai", label: "Esai" },
]
const KESULITAN_OPTIONS = [
  { value: "mudah", label: "Mudah" },
  { value: "sedang", label: "Sedang" },
  { value: "sulit", label: "Sulit" },
]

/**
 * Generate soal dijalankan di background TANPA menulis ke Knowledge Graph -- job.result.items
 * cuma berisi draf hasil LLM. Komponen ini nampilin draf itu buat direview dosen (edit teks/tipe/
 * kesulitan, hapus item atau konsep yang gak sesuai) sebelum benar-benar disimpan lewat
 * POST /dosen/soal/generate/confirm. Gak ada draft server-side yang perlu dibuang -- "Batal" cukup
 * reset state di parent.
 */
const SoalGenerateReview = ({ jobId, babId, onSaved, onCancel }) => {
  const [job, setJob] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saveState, setSaveState] = useState("idle") // idle | saving | saved | error
  const [savedCount, setSavedCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!jobId) return
    let stop = false
    const poll = async () => {
      try {
        const data = await getJob(jobId)
        if (stop) return
        setJob(data)
        if (data.status === "pending" || data.status === "running") {
          setTimeout(poll, 2000)
        } else if (data.status === "done" && data.result) {
          setDraft((prev) => prev ?? data.result.items.map((item, idx) => ({ ...item, _key: idx })))
        }
      } catch (err) {
        console.error(err)
      }
    }
    poll()
    return () => { stop = true }
  }, [jobId])

  if (!job) return null

  if (job.status === "pending" || job.status === "running") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 size={16} className="animate-spin text-blue-600" />
          <span className="text-sm font-bold text-slate-700">Menyusun draf soal dengan AI...</span>
        </div>
        {job.log?.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-3 max-h-40 overflow-y-auto text-[12px] font-mono text-slate-500 space-y-1">
            {job.log.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}
      </motion.div>
    )
  }

  if (job.status === "error") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-3 text-red-600 text-sm font-medium">
        <XCircle size={18} /> {job.error || "Gagal generate soal."}
      </motion.div>
    )
  }

  // job.status === "done"
  if (saveState === "saved") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center gap-2 text-green-700 font-bold text-sm">
        <CheckCircle2 size={18} /> {savedCount} soal berhasil disimpan.
      </motion.div>
    )
  }

  if (!draft) return null

  const updateItem = (key, patch) => {
    setDraft((prev) => prev.map((it) => (it._key === key ? { ...it, ...patch } : it)))
  }
  const removeItem = (key) => setDraft((prev) => prev.filter((it) => it._key !== key))
  const removeKonsep = (key, nama) => {
    setDraft((prev) => prev.map((it) => (it._key === key ? { ...it, konsep: it.konsep.filter((k) => k !== nama) } : it)))
  }

  const handleSave = async () => {
    setErrorMsg("")
    setSaveState("saving")
    try {
      const payload = draft.map(({ _key, ...rest }) => rest)
      const result = await confirmGeneratedSoal(babId, payload)
      setSavedCount(result.length)
      setSaveState("saved")
      onSaved?.()
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan soal")
      setSaveState("error")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 font-medium">
          Draf soal selesai dibuat, <span className="font-bold">belum tersimpan</span>. Tinjau tiap soal di bawah —
          edit teks/tipe/kesulitan, hapus konsep yang tidak sesuai, atau buang soal yang tidak dipakai sebelum menyimpan.
        </p>
      </div>

      {job.log?.some((l) => l.startsWith("Peringatan")) && (
        <p className="text-xs text-amber-600 font-medium">
          {job.log.find((l) => l.startsWith("Peringatan"))}
        </p>
      )}

      {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

      {draft.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-sm text-slate-400">
          Semua draf sudah dibuang. Klik "Batal" untuk generate ulang.
        </div>
      ) : (
        <div className="space-y-3">
          {draft.map((item) => (
            <div key={item._key} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <textarea
                  rows={2}
                  value={item.teks_soal}
                  onChange={(e) => updateItem(item._key, { teks_soal: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all text-sm text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item._key)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Buang soal ini"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={item.tipe}
                  onChange={(e) => updateItem(item._key, { tipe: e.target.value })}
                  className="px-3 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-600"
                >
                  {TIPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                  value={item.tingkat_kesulitan}
                  onChange={(e) => updateItem(item._key, { tingkat_kesulitan: e.target.value })}
                  className="px-3 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-600"
                >
                  {KESULITAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <textarea
                rows={1}
                placeholder="Jawaban referensi..."
                value={item.jawaban_referensi || ""}
                onChange={(e) => updateItem(item._key, { jawaban_referensi: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all text-xs text-slate-600"
              />

              <div className="flex flex-wrap gap-1.5">
                {item.konsep.map((k) => (
                  <span key={k} className="bg-white border border-slate-200 text-slate-600 pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold">
                    {k}
                    <button type="button" onClick={() => removeKonsep(item._key, k)} className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-red-600 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {item.konsep.length === 0 && (
                  <span className="text-[11px] text-red-500 italic">Soal ini tidak menguji konsep apa pun -- akan ditolak saat disimpan.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-xs font-bold text-slate-400">{draft.length} soal siap disimpan</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onCancel?.()}
            disabled={saveState === "saving"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || draft.length === 0 || draft.some((it) => it.konsep.length === 0)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all disabled:bg-slate-200 disabled:text-slate-400"
          >
            {saveState === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Semua
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default SoalGenerateReview
