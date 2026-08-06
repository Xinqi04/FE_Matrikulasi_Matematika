import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, XCircle, X, Plus, Save, Trash2, Sparkles, Youtube } from "lucide-react"
import { getJob, confirmYoutubeClassification, discardYoutubeDraft, getKonsep } from "../api"

/**
 * Klasifikasi YouTube dijalankan di background TANPA menulis ke Knowledge Graph -- job.result
 * cuma berisi draft (metadata video + konsep hasil LLM). Beda sama PDF: video ini mode
 * *klasifikasi* (closed vocabulary), jadi nambah konsep manual HARUS milih dari konsep yang
 * sudah ada di KG (bukan free-text) -- kalau ngarang nama sendiri gak akan nyambung pas disimpan.
 */
const YoutubeClassificationReview = ({ jobId, onSaved }) => {
  const [job, setJob] = useState(null)
  const [konsep, setKonsep] = useState(null)
  const [allKonsep, setAllKonsep] = useState([])
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [saveState, setSaveState] = useState("idle") // idle | saving | saved | error
  const [discardState, setDiscardState] = useState("idle") // idle | discarding | discarded | error
  const [savedSummary, setSavedSummary] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    getKonsep().then((list) => setAllKonsep(list.map((k) => k.nama))).catch(console.error)
  }, [])

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
          setKonsep((prev) => prev ?? [...data.result.konsep_terklasifikasi])
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
          <span className="text-sm font-bold text-slate-700">Mengambil metadata & mengklasifikasi video...</span>
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
        <XCircle size={18} /> {job.error || "Klasifikasi gagal."}
      </motion.div>
    )
  }

  // job.status === "done"
  if (saveState === "saved") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
          <CheckCircle2 size={18} /> {savedSummary?.detail || "Video berhasil disimpan ke Knowledge Graph."}
        </div>
        <p className="text-xs text-green-700/80">{savedSummary?.konsep_terklasifikasi?.length ?? 0} konsep tertaut.</p>
      </motion.div>
    )
  }

  if (discardState === "discarded") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-500 font-medium">
        Draft klasifikasi dibuang. Tidak ada perubahan yang disimpan ke Knowledge Graph.
      </motion.div>
    )
  }

  if (konsep === null) return null

  const { judul, channel, link, thumbnail } = job.result
  const filteredKonsep = allKonsep.filter(
    (k) => k.toLowerCase().includes(search.toLowerCase()) && !konsep.includes(k),
  )

  const removeKonsep = (nama) => setKonsep((prev) => prev.filter((k) => k !== nama))
  const addKonsep = (nama) => {
    setKonsep((prev) => (prev.includes(nama) ? prev : [...prev, nama]))
    setSearch("")
    setShowDropdown(false)
  }

  const handleSave = async () => {
    setErrorMsg("")
    setSaveState("saving")
    try {
      const result = await confirmYoutubeClassification(jobId, konsep)
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
      await discardYoutubeDraft(jobId)
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
          Klasifikasi selesai, <span className="font-bold">belum tersimpan</span> ke Knowledge Graph. Tinjau konsep hasil
          pemetaan di bawah — hapus yang tidak sesuai, atau tambah dari konsep yang sudah ada di KG.
        </p>
      </div>

      {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4">
        {thumbnail && (
          <img src={thumbnail} alt="" className="w-28 h-20 object-cover rounded-xl shrink-0" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-red-600 mb-1">
            <Youtube size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wide">{channel || "-"}</span>
          </div>
          <a href={link} target="_blank" rel="noreferrer" className="font-bold text-sm text-slate-800 hover:text-blue-600 transition-colors line-clamp-2">
            {judul}
          </a>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Konsep Terklasifikasi</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {konsep.length === 0 && (
            <span className="text-xs text-slate-400 italic">Tidak ada konsep -- tambahkan dari daftar di bawah.</span>
          )}
          {konsep.map((k) => (
            <span key={k} className="bg-white border border-slate-200 text-slate-600 pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold">
              {k}
              <button type="button" onClick={() => removeKonsep(k)} className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-red-600 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Cari konsep dari Knowledge Graph..."
            className="w-full px-3 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-xs font-medium text-slate-700"
          />
          {showDropdown && filteredKonsep.length > 0 && (
            <div className="absolute z-20 bg-white border border-slate-100 w-full mt-2 max-h-40 overflow-y-auto rounded-xl shadow-xl p-1.5">
              {filteredKonsep.slice(0, 30).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => addKonsep(k)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold flex items-center justify-between transition-colors"
                >
                  {k} <Plus size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />}

      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-xs font-bold text-slate-400">{konsep.length} konsep siap disimpan</span>
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

export default YoutubeClassificationReview
