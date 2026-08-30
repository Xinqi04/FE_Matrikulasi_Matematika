import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  UploadCloud, Youtube, FolderTree, PlayCircle, Loader2,
  ChevronDown, FileText, Link as LinkIcon, Trash2, AlertTriangle,
  Search, Pencil, X, Plus, Save, ChevronLeft, ChevronRight,
  BookOpen, Layers3,
} from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import Modal from "../../components/Modal"
import PdfExtractionReview from "../../components/PdfExtractionReview"
import YoutubeClassificationReview from "../../components/YoutubeClassificationReview"
import {
  extractPdf, classifyYoutube, getModul, getVideo, getKonsep,
  hapusModul, updateVideo, hapusVideo, updateNamaModul, tambahBab,
  updateNamaBab, tambahKonsep, updateNamaKonsep,
} from "../../api"

const VIDEO_PAGE_SIZE = 10

const TABS = [
  { id: "pdf", label: "Upload PDF", icon: <UploadCloud size={16} /> },
  { id: "youtube", label: "Klasifikasi YouTube", icon: <Youtube size={16} /> },
  { id: "struktur", label: "Struktur Modul", icon: <FolderTree size={16} /> },
  { id: "video", label: "Video Materi", icon: <PlayCircle size={16} /> },
]

const ManageMateri = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState("pdf")

  // PDF form
  const [file, setFile] = useState(null)
  const [namaDomain, setNamaDomain] = useState("")
  const [pdfJobId, setPdfJobId] = useState(null)
  const [pdfSubmitting, setPdfSubmitting] = useState(false)
  const [pdfError, setPdfError] = useState("")

  // Youtube form
  const [ytLink, setYtLink] = useState("")
  const [materiQuery, setMateriQuery] = useState("")
  const [ytJobId, setYtJobId] = useState(null)
  const [ytSubmitting, setYtSubmitting] = useState(false)
  const [ytError, setYtError] = useState("")

  // KG data
  const [modul, setModul] = useState([])
  const [video, setVideo] = useState([])
  const [allKonsep, setAllKonsep] = useState([])
  const [kgLoading, setKgLoading] = useState(true)
  const [expandedBab, setExpandedBab] = useState({})
  const [expandedModul, setExpandedModul] = useState({})
  const [strukturSearch, setStrukturSearch] = useState("")
  const [kgRefreshTick, setKgRefreshTick] = useState(0)

  // Editor struktur modul/bab/konsep
  const [structureEditor, setStructureEditor] = useState(null)
  const [structureName, setStructureName] = useState("")
  const [structureNumber, setStructureNumber] = useState("")
  const [structureSaving, setStructureSaving] = useState(false)
  const [structureError, setStructureError] = useState("")

  // Hapus modul
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Video: search & pagination
  const [videoSearch, setVideoSearch] = useState("")
  const [videoPage, setVideoPage] = useState(1)

  // Video: edit
  const [editTarget, setEditTarget] = useState(null)
  const [editJudul, setEditJudul] = useState("")
  const [editKonsep, setEditKonsep] = useState([])
  const [editKonsepSearch, setEditKonsepSearch] = useState("")
  const [editKonsepDropdown, setEditKonsepDropdown] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")

  // Video: hapus
  const [deleteVideoTarget, setDeleteVideoTarget] = useState(null)
  const [deletingVideo, setDeletingVideo] = useState(false)
  const [deleteVideoError, setDeleteVideoError] = useState("")

  useEffect(() => {
    Promise.all([getModul(), getVideo(), getKonsep()])
      .then(([m, v, k]) => { setModul(m); setVideo(v); setAllKonsep(k.map((item) => item.nama)) })
      .catch(console.error)
      .finally(() => setKgLoading(false))
  }, [kgRefreshTick])

  const filteredVideo = useMemo(() => {
    const q = videoSearch.trim().toLowerCase()
    if (!q) return video
    return video.filter((v) =>
      v.judul.toLowerCase().includes(q) ||
      (v.channel || "").toLowerCase().includes(q) ||
      v.konsep.some((k) => k.toLowerCase().includes(q)),
    )
  }, [video, videoSearch])

  const videoPageCount = Math.max(1, Math.ceil(filteredVideo.length / VIDEO_PAGE_SIZE))
  const currentVideoPage = Math.min(videoPage, videoPageCount)
  const pagedVideo = filteredVideo.slice((currentVideoPage - 1) * VIDEO_PAGE_SIZE, currentVideoPage * VIDEO_PAGE_SIZE)

  const openEditVideo = (v) => {
    setEditTarget(v)
    setEditJudul(v.judul)
    setEditKonsep([...v.konsep])
    setEditKonsepSearch("")
    setEditError("")
  }

  const closeEditVideo = () => {
    setEditTarget(null)
    setEditError("")
  }

  const removeEditKonsep = (nama) => setEditKonsep((prev) => prev.filter((k) => k !== nama))
  const addEditKonsep = (nama) => {
    setEditKonsep((prev) => (prev.includes(nama) ? prev : [...prev, nama]))
    setEditKonsepSearch("")
    setEditKonsepDropdown(false)
  }

  const handleSaveEditVideo = async () => {
    if (!editTarget) return
    setEditSaving(true)
    setEditError("")
    try {
      const updated = await updateVideo(editTarget.video_id, { judul: editJudul, konsep: editKonsep })
      setVideo((prev) => prev.map((v) => (v.video_id === updated.video_id ? updated : v)))
      setEditTarget(null)
    } catch (err) {
      setEditError(err.message || "Gagal menyimpan perubahan video")
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeleteVideo = async () => {
    if (!deleteVideoTarget) return
    setDeletingVideo(true)
    setDeleteVideoError("")
    try {
      await hapusVideo(deleteVideoTarget.video_id)
      setVideo((prev) => prev.filter((v) => v.video_id !== deleteVideoTarget.video_id))
      setDeleteVideoTarget(null)
    } catch (err) {
      setDeleteVideoError(err.message || "Gagal menghapus video")
    } finally {
      setDeletingVideo(false)
    }
  }

  const handleDeleteModul = async () => {
    setDeleting(true)
    setDeleteError("")
    try {
      await hapusModul(deleteTarget.id)
      setDeleteTarget(null)
      setKgRefreshTick((t) => t + 1)
    } catch (err) {
      setDeleteError(err.message || "Gagal menghapus modul")
    } finally {
      setDeleting(false)
    }
  }

  const handlePdfSubmit = async (e) => {
    e.preventDefault()
    if (!file || !namaDomain.trim()) return
    setPdfError("")
    setPdfSubmitting(true)
    try {
      const res = await extractPdf(file, namaDomain.trim())
      setPdfJobId(res.job_id)
    } catch (err) {
      setPdfError(err.message || "Gagal memulai ekstraksi PDF")
    } finally {
      setPdfSubmitting(false)
    }
  }

  const handleYtSubmit = async (e) => {
    e.preventDefault()
    if (!ytLink) return
    setYtError("")
    setYtSubmitting(true)
    try {
      const res = await classifyYoutube(ytLink, materiQuery || undefined)
      setYtJobId(res.job_id)
    } catch (err) {
      setYtError(err.message || "Gagal memulai klasifikasi video")
    } finally {
      setYtSubmitting(false)
    }
  }

  const toggleBab = (id) => setExpandedBab((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleModul = (id) => setExpandedModul((prev) => ({ ...prev, [id]: !prev[id] }))

  const openStructureEditor = (config) => {
    setStructureEditor(config)
    setStructureName(config.currentName || "")
    setStructureNumber(config.number || "")
    setStructureError("")
  }

  const closeStructureEditor = () => {
    setStructureEditor(null)
    setStructureError("")
  }

  const saveStructure = async () => {
    const nama = structureName.trim()
    if (!structureEditor || !nama) return
    setStructureSaving(true)
    setStructureError("")
    try {
      if (structureEditor.type === "edit-modul") {
        await updateNamaModul(structureEditor.modulId, nama)
      } else if (structureEditor.type === "add-bab") {
        await tambahBab(structureEditor.modulId, { nama, nomor: structureNumber.trim() || null })
      } else if (structureEditor.type === "edit-bab") {
        await updateNamaBab(structureEditor.babId, nama)
      } else if (structureEditor.type === "add-konsep") {
        await tambahKonsep(structureEditor.ownerId, { nama })
      } else if (structureEditor.type === "edit-konsep") {
        await updateNamaKonsep(structureEditor.ownerId, structureEditor.currentName, nama)
      }
      closeStructureEditor()
      setKgRefreshTick((tick) => tick + 1)
    } catch (err) {
      setStructureError(err.message || "Gagal menyimpan perubahan struktur")
    } finally {
      setStructureSaving(false)
    }
  }

  return (
    <DashboardLayout role="dosen" title="Kelola Materi" subtitle="Ekstraksi modul PDF, klasifikasi video YouTube, dan struktur Knowledge Graph.">

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              tab === t.id ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white border border-gray-100 text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "pdf" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold">Ekstraksi Modul dari PDF</h2>
              <p className="text-xs text-gray-400">File akan diproses di background menjadi Bab/SubBab/Konsep.</p>
            </div>
          </div>

          {pdfError && <p className="text-sm text-red-600 font-medium mb-4">{pdfError}</p>}

          <form onSubmit={handlePdfSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">File PDF</label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-bold file:text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Modul</label>
              <input
                required
                value={namaDomain}
                onChange={(e) => setNamaDomain(e.target.value)}
                placeholder="Contoh: Matematika Dasar"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
              />
              <p className="text-[11px] text-slate-400 ml-1">Setiap nama modul yang berbeda akan membuat modul baru secara terpisah. Modul ID dibuat otomatis dari nama ini.</p>
            </div>
            <button
              type="submit"
              disabled={pdfSubmitting}
              className="w-full py-3.5 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
            >
              {pdfSubmitting ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              {pdfSubmitting ? "Mengunggah..." : "Mulai Ekstraksi"}
            </button>
          </form>

          <PdfExtractionReview jobId={pdfJobId} onSaved={() => setKgRefreshTick((t) => t + 1)} />

          {pdfJobId && (
            <button
              onClick={() => navigate("/dosen/jobs")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-4"
            >
              Lihat semua riwayat proses →
            </button>
          )}
        </div>
      )}

      {tab === "youtube" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Youtube size={20} />
            </div>
            <div>
              <h2 className="font-bold">Klasifikasi Video YouTube</h2>
              <p className="text-xs text-gray-400">Video akan dipetakan ke konsep-konsep di Knowledge Graph.</p>
            </div>
          </div>

          {ytError && <p className="text-sm text-red-600 font-medium mb-4">{ytError}</p>}

          <form onSubmit={handleYtSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Link Video</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  required
                  value={ytLink}
                  onChange={(e) => setYtLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Materi Query (opsional)</label>
              <input
                value={materiQuery}
                onChange={(e) => setMateriQuery(e.target.value)}
                placeholder="Bantu arahkan pencarian konsep, mis. 'turunan fungsi'"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
              />
            </div>
            <button
              type="submit"
              disabled={ytSubmitting}
              className="w-full py-3.5 rounded-2xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
            >
              {ytSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Youtube size={18} />}
              {ytSubmitting ? "Memproses..." : "Klasifikasikan Video"}
            </button>
          </form>

          <YoutubeClassificationReview jobId={ytJobId} onSaved={() => setKgRefreshTick((t) => t + 1)} />

          {ytJobId && (
            <button
              onClick={() => navigate("/dosen/jobs")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-4"
            >
              Lihat semua riwayat proses →
            </button>
          )}
        </div>
      )}

      {tab === "struktur" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daftar Modul</h2>
            <p className="mt-1 text-sm text-gray-500">Pilih modul untuk melihat dan mengelola daftar bab di dalamnya.</p>
          </div>
          {kgLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">Memuat struktur modul...</div>
          ) : modul.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">Belum ada modul di Knowledge Graph.</div>
          ) : modul.map((m) => (
            <section key={m.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${expandedModul[m.id] ? "border-blue-200 ring-1 ring-blue-50" : "border-gray-100 hover:border-blue-100"}`}>
              <div className="flex items-center gap-3 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => toggleModul(m.id)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  aria-expanded={!!expandedModul[m.id]}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <BookOpen size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-gray-900">{m.nama_domain}</span>
                    <span className="mt-1 block text-xs text-gray-400">{m.bab.length} bab · {m.bab.reduce((total, bab) => total + bab.jumlah_konsep, 0)} konsep</span>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${expandedModul[m.id] ? "rotate-180 text-blue-600" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => openStructureEditor({ type: "edit-modul", modulId: m.id, currentName: m.nama_domain, title: "Edit Nama Modul", label: "Nama Modul" })}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50"
                  title="Edit Nama Modul"
                >
                  <Pencil size={14} /> <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(m)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                  title="Hapus Modul"
                >
                  <Trash2 size={14} /> <span className="hidden sm:inline">Hapus Modul</span>
                </button>
              </div>

              {expandedModul[m.id] && (
                <div className="border-t border-gray-100 bg-gray-50/40 p-3 sm:p-5">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Layers3 size={17} className="text-blue-600" />
                          <h3 className="font-bold text-gray-900">Daftar Bab</h3>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Bab pada modul {m.nama_domain}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                          <input
                            value={strukturSearch}
                            onChange={(e) => setStrukturSearch(e.target.value)}
                            placeholder="Cari bab atau konsep..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-xs text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-56"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => openStructureEditor({ type: "add-bab", modulId: m.id, title: `Tambah Bab — ${m.nama_domain}`, label: "Nama Bab" })}
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                          <Plus size={15} /> Tambah Bab
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                    {m.bab.filter((bab) => {
                      const query = strukturSearch.trim().toLowerCase()
                      if (!query) return true
                      return bab.nama.toLowerCase().includes(query) || bab.konsep.some((k) => k.toLowerCase().includes(query)) || bab.subbab.some((sub) => sub.nama.toLowerCase().includes(query) || sub.konsep.some((k) => k.toLowerCase().includes(query)))
                    }).map((bab) => (
                  <div key={bab.id}>
                    <div className="flex items-center gap-2 p-2 pr-4 hover:bg-gray-50/50">
                      <button
                        onClick={() => toggleBab(bab.id)}
                        className="flex min-w-0 flex-1 items-center justify-between p-2 text-left"
                        aria-expanded={!!expandedBab[bab.id]}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="shrink-0 text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">Bab {bab.nomor}</span>
                          <span className="truncate font-medium text-sm text-gray-800">{bab.nama}</span>
                          <span className="shrink-0 text-[11px] text-gray-400">{bab.jumlah_konsep} konsep</span>
                        </div>
                        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${expandedBab[bab.id] ? "rotate-180" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openStructureEditor({ type: "edit-bab", babId: bab.id, currentName: bab.nama, title: `Edit Bab ${bab.nomor}`, label: "Nama Bab" })}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-bold text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil size={13} /> <span className="hidden sm:inline">Edit</span>
                      </button>
                    </div>
                    {expandedBab[bab.id] && (
                      <div className="pb-4 pl-8 pr-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Konsep Bab</p>
                          <button
                            type="button"
                            onClick={() => openStructureEditor({ type: "add-konsep", ownerId: bab.id, title: `Tambah Konsep — ${bab.nama}`, label: "Nama Konsep" })}
                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                          >
                            <Plus size={12} /> Tambah Konsep
                          </button>
                        </div>
                        {bab.konsep.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {bab.konsep.map((k) => (
                              <span key={k} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 py-1 pl-2.5 pr-1 text-[11px] font-bold text-blue-700">
                                {k}
                                <button type="button" onClick={() => openStructureEditor({ type: "edit-konsep", ownerId: bab.id, currentName: k, title: "Edit Konsep", label: "Nama Konsep" })} className="rounded p-1 hover:bg-blue-100" title={`Edit ${k}`}>
                                  <Pencil size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {bab.subbab.length === 0 && bab.konsep.length === 0 && (
                          <p className="text-xs text-gray-400">Tidak ada sub-bab maupun konsep.</p>
                        )}
                        {bab.subbab.map((sub) => (
                          <div key={sub.id} className="text-sm text-gray-600 bg-gray-50/60 rounded-lg px-3 py-2 space-y-1.5">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-gray-400">{sub.nomor}</span>
                              <span>{sub.nama}</span>
                              <span className="text-[11px] text-gray-400 ml-auto">{sub.jumlah_konsep} konsep</span>
                              <button type="button" onClick={() => openStructureEditor({ type: "add-konsep", ownerId: sub.id, title: `Tambah Konsep — ${sub.nama}`, label: "Nama Konsep" })} className="rounded-lg p-1.5 text-blue-700 hover:bg-blue-100" title="Tambah Konsep">
                                <Plus size={13} />
                              </button>
                            </div>
                            {sub.konsep.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pl-6">
                                {sub.konsep.map((k) => (
                                  <span key={k} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 py-1 pl-2.5 pr-1 text-[11px] font-bold text-blue-700">
                                    {k}
                                    <button type="button" onClick={() => openStructureEditor({ type: "edit-konsep", ownerId: sub.id, currentName: k, title: "Edit Konsep", label: "Nama Konsep" })} className="rounded p-1 hover:bg-blue-100" title={`Edit ${k}`}>
                                      <Pencil size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                    ))}
                    {m.bab.length === 0 && (
                      <div className="p-8 text-center text-sm text-gray-400">Belum ada bab pada modul ini.</div>
                    )}
                    {m.bab.length > 0 && m.bab.filter((bab) => {
                      const query = strukturSearch.trim().toLowerCase()
                      return !query || bab.nama.toLowerCase().includes(query) || bab.konsep.some((k) => k.toLowerCase().includes(query)) || bab.subbab.some((sub) => sub.nama.toLowerCase().includes(query) || sub.konsep.some((k) => k.toLowerCase().includes(query)))
                    }).length === 0 && (
                      <div className="p-8 text-center text-sm text-gray-400">Bab atau konsep tidak ditemukan.</div>
                    )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {tab === "video" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                value={videoSearch}
                onChange={(e) => { setVideoSearch(e.target.value); setVideoPage(1) }}
                placeholder="Cari judul, channel, atau konsep..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-600">Judul</th>
                  <th className="p-4 text-left font-semibold text-gray-600">Channel</th>
                  <th className="p-4 text-left font-semibold text-gray-600">Konsep</th>
                  <th className="p-4 text-center font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-center font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {kgLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                ) : filteredVideo.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">
                    {video.length === 0 ? "Belum ada video materi." : "Tidak ada video yang cocok dengan pencarian."}
                  </td></tr>
                ) : pagedVideo.map((v) => (
                  <tr key={v.video_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <a href={v.link} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {v.judul}
                      </a>
                    </td>
                    <td className="p-4 text-gray-500">{v.channel || "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {v.konsep.slice(0, 3).map((k) => (
                          <Badge key={k} variant="blue">{k}</Badge>
                        ))}
                        {v.konsep.length > 3 && <span className="text-[11px] text-gray-400">+{v.konsep.length - 3}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={v.status_validasi === "valid" ? "green" : "gray"}>{v.status_validasi || "-"}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditVideo(v)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Video"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteVideoTarget(v)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Video"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!kgLoading && filteredVideo.length > 0 && (
            <div className="flex items-center justify-between gap-4 p-4 border-t border-gray-50">
              <span className="text-xs text-gray-400">
                Menampilkan {(currentVideoPage - 1) * VIDEO_PAGE_SIZE + 1}–{Math.min(currentVideoPage * VIDEO_PAGE_SIZE, filteredVideo.length)} dari {filteredVideo.length} video
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                  disabled={currentVideoPage <= 1}
                  className="p-2 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-gray-600">{currentVideoPage} / {videoPageCount}</span>
                <button
                  onClick={() => setVideoPage((p) => Math.min(videoPageCount, p + 1))}
                  disabled={currentVideoPage >= videoPageCount}
                  className="p-2 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!structureEditor} onClose={closeStructureEditor} title={structureEditor?.title || "Edit Struktur"}>
        <form onSubmit={(e) => { e.preventDefault(); saveStructure() }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">
              {structureEditor?.label || "Nama"}
            </label>
            <input
              autoFocus
              required
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
              placeholder={`Masukkan ${(structureEditor?.label || "nama").toLowerCase()}`}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {structureEditor?.type === "add-bab" && (
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Nomor Bab</label>
              <input
                value={structureNumber}
                onChange={(e) => setStructureNumber(e.target.value)}
                placeholder="Otomatis jika dikosongkan"
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
              <p className="ml-1 text-[11px] text-slate-400">Kosongkan untuk memakai nomor setelah bab terakhir.</p>
            </div>
          )}

          {structureError && <p className="text-sm font-medium text-red-600">{structureError}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeStructureEditor} className="flex-1 rounded-2xl bg-gray-100 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-200">
              Batal
            </button>
            <button type="submit" disabled={structureSaving || !structureName.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-200">
              {structureSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {structureSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteError("") }} title="Hapus Modul">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">
              Semua Bab, SubBab, Soal, dan jawaban/nilai mahasiswa dalam modul{" "}
              <span className="font-bold">{deleteTarget?.nama_domain}</span> ({deleteTarget?.bab.length} bab) akan
              dihapus PERMANEN. Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
          {deleteError && <p className="text-sm text-red-600 font-medium">{deleteError}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setDeleteTarget(null); setDeleteError("") }}
              className="flex-1 py-3 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteModul}
              disabled={deleting}
              className="flex-1 py-3 rounded-2xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all disabled:bg-red-200 flex items-center justify-center gap-2"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {deleting ? "Menghapus..." : "Hapus Permanen"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={closeEditVideo} title="Edit Video Materi">
        <div className="space-y-4">
          {editError && <p className="text-sm text-red-600 font-medium">{editError}</p>}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Judul</label>
            <input
              value={editJudul}
              onChange={(e) => setEditJudul(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
            />
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Konsep</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {editKonsep.length === 0 && (
                <span className="text-xs text-slate-400 italic">Tidak ada konsep -- tambahkan dari daftar di bawah.</span>
              )}
              {editKonsep.map((k) => (
                <span key={k} className="bg-white border border-slate-200 text-slate-600 pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold">
                  {k}
                  <button type="button" onClick={() => removeEditKonsep(k)} className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-red-600 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="relative">
              <input
                value={editKonsepSearch}
                onChange={(e) => { setEditKonsepSearch(e.target.value); setEditKonsepDropdown(true) }}
                onFocus={() => setEditKonsepDropdown(true)}
                placeholder="Cari konsep dari Knowledge Graph..."
                className="w-full px-3 py-2 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 text-xs font-medium text-slate-700"
              />
              {editKonsepDropdown && (() => {
                const options = allKonsep.filter(
                  (k) => k.toLowerCase().includes(editKonsepSearch.toLowerCase()) && !editKonsep.includes(k),
                )
                if (options.length === 0) return null
                return (
                  <div className="absolute z-20 bg-white border border-slate-100 w-full mt-2 max-h-40 overflow-y-auto rounded-xl shadow-xl p-1.5">
                    {options.slice(0, 30).map((k) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => addEditKonsep(k)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold flex items-center justify-between transition-colors"
                      >
                        {k} <Plus size={12} />
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          {editKonsepDropdown && <div className="fixed inset-0 z-10" onClick={() => setEditKonsepDropdown(false)} />}

          <div className="flex gap-3 relative z-20">
            <button
              onClick={closeEditVideo}
              className="flex-1 py-3 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSaveEditVideo}
              disabled={editSaving}
              className="flex-1 py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-blue-200 flex items-center justify-center gap-2"
            >
              {editSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteVideoTarget} onClose={() => { setDeleteVideoTarget(null); setDeleteVideoError("") }} title="Hapus Video Materi">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">
              Video <span className="font-bold">{deleteVideoTarget?.judul}</span> beserta seluruh tautan konsepnya akan
              dihapus PERMANEN dari Knowledge Graph. Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
          {deleteVideoError && <p className="text-sm text-red-600 font-medium">{deleteVideoError}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setDeleteVideoTarget(null); setDeleteVideoError("") }}
              className="flex-1 py-3 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteVideo}
              disabled={deletingVideo}
              className="flex-1 py-3 rounded-2xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all disabled:bg-red-200 flex items-center justify-center gap-2"
            >
              {deletingVideo ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {deletingVideo ? "Menghapus..." : "Hapus Permanen"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default ManageMateri
