import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, XCircle, X, Plus, Save, Trash2, Sparkles } from "lucide-react"
import Badge from "./Badge"
import { getJob, confirmPdfExtraction, discardPdfDraft } from "../api"

/**
 * Ekstraksi PDF dijalankan di background TANPA menulis ke Knowledge Graph -- job.result cuma
 * berisi draft (Bab/SubBab + konsep hasil LLM). Komponen ini nampilin draft itu buat direview
 * dosen (hapus/tambah konsep) sebelum benar-benar disimpan lewat POST /pdf/confirm.
 */
const PdfExtractionReview = ({ jobId, onSaved }) => {
  const [job, setJob] = useState(null)
  const [draft, setDraft] = useState(null)
  const [inputs, setInputs] = useState({})
  const [saveState, setSaveState] = useState("idle") // idle | saving | saved | error
  const [discardState, setDiscardState] = useState("idle") // idle | discarding | discarded | error
  const [savedSummary, setSavedSummary] = useState(null)
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
          setDraft((prev) => prev ?? data.result.unit.map((u) => ({ ...u, konsep: [...u.konsep] })))
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 size={16} className="animate-spin text-blue-600" />
          <span className="text-sm font-bold text-slate-700">Mengekstrak struktur & konsep dari PDF...</span>
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-3 text-red-600 text-sm font-medium">
        <XCircle size={18} /> {job.error || "Ekstraksi gagal."}
      </motion.div>
    )
  }

  // job.status === "done"
  if (saveState === "saved") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
          <CheckCircle2 size={18} /> {savedSummary?.detail || "Berhasil disimpan ke Knowledge Graph."}
        </div>
        <p className="text-xs text-green-700/80">{savedSummary?.jumlah_konsep_total ?? 0} konsep tersimpan.</p>
      </motion.div>
    )
  }

  if (discardState === "discarded") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-500 font-medium">
        Draft ekstraksi dibuang. Tidak ada perubahan yang disimpan ke Knowledge Graph.
      </motion.div>
    )
  }

  if (!draft) return null

  const totalKonsep = draft.reduce((sum, u) => sum + u.konsep.length, 0)

  const removeKonsep = (unitId, nama) => {
    setDraft((prev) => prev.map((u) => u.unit_id === unitId ? { ...u, konsep: u.konsep.filter((k) => k !== nama) } : u))
  }

  const addKonsep = (unitId) => {
    const nama = (inputs[unitId] || "").trim()
    if (!nama) return
    setDraft((prev) => prev.map((u) => {
      if (u.unit_id !== unitId) return u
      if (u.konsep.some((k) => k.toLowerCase() === nama.toLowerCase())) return u
      return { ...u, konsep: [...u.konsep, nama] }
    }))
    setInputs((prev) => ({ ...prev, [unitId]: "" }))
  }

  const handleSave = async () => {
    setErrorMsg("")
    setSaveState("saving")
    try {
      const payload = draft.map((u) => ({ unit_id: u.unit_id, konsep: u.konsep }))
      const result = await confirmPdfExtraction(jobId, payload)
      setSavedSummary(result)
      setSaveState("saved")
      onSaved?.()
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan ke Knowledge Graph")
      setSaveState("error")
    }
  }

  const handleDiscard = async () => {
    setErrorMsg("")
    setDiscardState("discarding")
    try {
      await discardPdfDraft(jobId)
      setDiscardState("discarded")
    } catch (err) {
      setErrorMsg(err.message || "Gagal membuang draft")
      setDiscardState("error")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 font-medium">
          Ekstraksi selesai, <span className="font-bold">belum tersimpan</span> ke Knowledge Graph. Tinjau tiap konsep di bawah —
          hapus yang tidak sesuai dengan tanda ×, atau tambahkan konsep lain secara manual sebelum menyimpan.
        </p>
      </div>

      {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

      <div className="space-y-3">
        {draft.map((u) => (
          <div key={u.unit_id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={u.level === "bab" ? "blue" : "purple"}>{u.label}</Badge>
              <span className="text-sm font-bold text-slate-700">{u.judul}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {u.konsep.length === 0 && (
                <span className="text-xs text-slate-400 italic">Tidak ada konsep -- tambahkan manual di bawah.</span>
              )}
              {u.konsep.map((k) => (
                <span key={k} className="bg-white border border-slate-200 text-slate-600 pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold">
                  {k}
                  <button type="button" onClick={() => removeKonsep(u.unit_id, k)} className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-red-600 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={inputs[u.unit_id] || ""}
                onChange={(e) => setInputs((prev) => ({ ...prev, [u.unit_id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKonsep(u.unit_id) } }}
                placeholder="Tambah konsep manual..."
                className="flex-1 px-3 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-xs font-medium text-slate-700"
              />
              <button
                type="button"
                onClick={() => addKonsep(u.unit_id)}
                className="px-3 py-2 bg-white border-2 border-slate-100 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-xs font-bold text-slate-400">{totalKonsep} konsep siap disimpan</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={discardState === "discarding" || saveState === "saving"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-40"
          >
            {discardState === "discarding" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Buang
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || discardState === "discarding"}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all disabled:bg-slate-200 disabled:text-slate-400"
          >
            {saveState === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan ke Knowledge Graph
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default PdfExtractionReview
