import { useEffect, useMemo, useState } from "react"
import { motion as Motion } from "framer-motion"
import { Plus, Trash2, Pencil, Sparkles, Loader2, X, AlertCircle, BookOpen, ChevronDown, CheckCircle2, ListChecks, Info } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Modal from "../../components/Modal"
import Badge from "../../components/Badge"
import SoalGenerateReview from "../../components/SoalGenerateReview"
import { getModul, getSoalBab, buatSoal, updateSoal, hapusSoal, suggestKonsep, generateSoal, setSoalUjian } from "../../api"

const emptyForm = { teks_soal: "", tipe: "isian_singkat", jawaban_referensi: "", tingkat_kesulitan: "sedang", konsep: [] }
const emptyGenerateForm = { jumlah: 5, tipe: "", tingkat_kesulitan: "" }

const ManageSoal = () => {
  const [modul, setModul] = useState([])
  const [modulId, setModulId] = useState("")
  const [babId, setBabId] = useState("")
  const [soalByBab, setSoalByBab] = useState({})
  const [expandedBab, setExpandedBab] = useState({})
  const [activeTab, setActiveTab] = useState("semua")
  const [togglingSoal, setTogglingSoal] = useState(null)
  const [loadingSoal, setLoadingSoal] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [error, setError] = useState("")

  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [generateForm, setGenerateForm] = useState(emptyGenerateForm)
  const [generateJobId, setGenerateJobId] = useState(null)
  const [generateSubmitting, setGenerateSubmitting] = useState(false)
  const [generateError, setGenerateError] = useState("")

  useEffect(() => {
    getModul().then(setModul).catch(console.error)
  }, [])

  const modulOptions = useMemo(
    () => modul.map((m) => ({ id: m.id, label: m.nama_domain })),
    [modul],
  )

  const selectedBab = useMemo(() => {
    const m = modul.find((x) => x.id === modulId)
    return m ? m.bab.find((b) => b.id === babId) || null : null
  }, [modul, modulId, babId])

  const konsepBab = useMemo(() => {
    if (!selectedBab) return []
    const set = new Set(selectedBab.konsep || [])
    for (const sub of selectedBab.subbab || []) {
      for (const k of sub.konsep || []) set.add(k)
    }
    return Array.from(set).sort()
  }, [selectedBab])

  const handleModulChange = (id) => {
    setModulId(id)
    setBabId("")
    setSoalByBab({})
    const selected = modul.find((item) => item.id === id)
    if (selected?.bab.length) {
      setExpandedBab({ [selected.bab[0].id]: true })
      loadAllSoal(selected)
    }
  }

  const selectedModul = useMemo(() => modul.find((item) => item.id === modulId) || null, [modul, modulId])

  const loadAllSoal = async (selected = selectedModul) => {
    if (!selected) { setSoalByBab({}); return }
    setLoadingSoal(true)
    try {
      const entries = await Promise.all(selected.bab.map(async (bab) => [bab.id, await getSoalBab(bab.id)]))
      setSoalByBab(Object.fromEntries(entries))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSoal(false)
    }
  }

  const toggleKonsep = (nama) => {
    setForm((prev) => ({
      ...prev,
      konsep: prev.konsep.includes(nama) ? prev.konsep.filter((k) => k !== nama) : [...prev.konsep, nama],
    }))
  }

  const handleSuggest = async () => {
    if (!form.teks_soal || !babId) return
    setSuggesting(true)
    try {
      const res = await suggestKonsep(babId, form.teks_soal)
      setForm((prev) => ({ ...prev, konsep: Array.from(new Set([...prev.konsep, ...res.konsep_saran])) }))
    } catch (err) {
      setError(err.message || "Gagal mendapatkan saran konsep")
    } finally {
      setSuggesting(false)
    }
  }

  const openCreate = (targetBabId) => {
    setBabId(targetBabId)
    setEditTarget(null)
    setForm(emptyForm)
    setError("")
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setBabId(s.bab_id)
    setEditTarget(s)
    setForm({
      teks_soal: s.teks_soal,
      tipe: s.tipe,
      jawaban_referensi: s.jawaban_referensi || "",
      tingkat_kesulitan: s.tingkat_kesulitan || "sedang",
      konsep: [...s.konsep],
    })
    setError("")
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      if (editTarget) {
        await updateSoal(editTarget.id, form)
      } else {
        await buatSoal({ bab_id: babId, ...form })
      }
      setModalOpen(false)
      setEditTarget(null)
      setForm(emptyForm)
      loadAllSoal()
    } catch (err) {
      setError(err.message || "Gagal menyimpan soal")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (soalId) => {
    await hapusSoal(soalId)
    loadAllSoal()
  }

  const openGenerate = (targetBabId) => {
    setBabId(targetBabId)
    setGenerateForm(emptyGenerateForm)
    setGenerateJobId(null)
    setGenerateError("")
    setGenerateModalOpen(true)
  }

  const closeGenerate = () => {
    setGenerateModalOpen(false)
    setGenerateJobId(null)
    setGenerateError("")
  }

  const handleGenerateSubmit = async (e) => {
    e.preventDefault()
    setGenerateError("")
    setGenerateSubmitting(true)
    try {
      const res = await generateSoal({
        bab_id: babId,
        jumlah: Number(generateForm.jumlah),
        tipe: generateForm.tipe || null,
        tingkat_kesulitan: generateForm.tingkat_kesulitan || null,
      })
      setGenerateJobId(res.job_id)
    } catch (err) {
      setGenerateError(err.message || "Gagal memulai generate soal")
    } finally {
      setGenerateSubmitting(false)
    }
  }

  const handleGenerateSaved = () => {
    loadAllSoal()
    setGenerateModalOpen(false)
    setGenerateJobId(null)
  }

  const handleToggleUjian = async (item) => {
    setTogglingSoal(item.id)
    try {
      const updated = await setSoalUjian(item.id, !item.untuk_ujian)
      setSoalByBab((current) => ({
        ...current,
        [item.bab_id]: (current[item.bab_id] || []).map((soalItem) => soalItem.id === item.id ? updated : soalItem),
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingSoal(null)
    }
  }

  const totalSoal = Object.values(soalByBab).flat().length
  const totalSoalUjian = Object.values(soalByBab).flat().filter((item) => item.untuk_ujian).length

  return (
    <DashboardLayout role="dosen" title="Kelola Soal" subtitle="Buat, kelola, dan pilih soal yang digunakan bersama untuk pretest & posttest.">
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="max-w-xl">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Modul</label>
          <select
            value={modulId}
            onChange={(e) => handleModulChange(e.target.value)}
            className="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700"
          >
            <option value="">-- Pilih Modul --</option>
            {modulOptions.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {selectedModul && <p className="ml-1 mt-2 text-xs text-gray-400">{selectedModul.bab.length} bab tersedia dalam modul ini.</p>}
        </div>
      </div>

      {!modulId ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
          <BookOpen size={34} className="mx-auto mb-3 text-blue-300" />
          <h2 className="font-semibold text-gray-900">Pilih modul terlebih dahulu</h2>
          <p className="mt-1 text-sm text-gray-400">Daftar bab dan bank soal akan muncul di sini.</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-6">
              <button type="button" onClick={() => setActiveTab("semua")} className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${activeTab === "semua" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
                <ListChecks size={16} /> Semua Soal <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{totalSoal}</span>
              </button>
              <button type="button" onClick={() => setActiveTab("ujian")} className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${activeTab === "ujian" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
                <CheckCircle2 size={16} /> Soal Ujian <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">{totalSoalUjian}</span>
              </button>
            </div>
            <div className="text-xs font-medium text-gray-400">{selectedModul?.nama_domain}</div>
          </div>

          <div className="flex items-start gap-3 border-b border-blue-100 bg-blue-50/70 px-5 py-4 text-sm text-blue-800">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p><strong>Satu paket untuk dua tahap.</strong> Soal yang ditandai sebagai Soal Ujian digunakan sama persis pada pretest dan posttest.</p>
          </div>

          {loadingSoal ? (
            <div className="p-12 text-center text-gray-400">Memuat bank soal...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedModul?.bab.map((bab) => {
                const semuaSoalBab = soalByBab[bab.id] || []
                const soalUjianBab = semuaSoalBab.filter((item) => item.untuk_ujian)
                const visibleSoal = activeTab === "ujian" ? soalUjianBab : semuaSoalBab
                const isExpanded = !!expandedBab[bab.id]
                return (
                  <div key={bab.id}>
                    <div className="flex items-center gap-2 p-3 pr-5 hover:bg-gray-50/60">
                      <button type="button" onClick={() => setExpandedBab((current) => ({ ...current, [bab.id]: !current[bab.id] }))} className="flex min-w-0 flex-1 items-center gap-3 p-2 text-left" aria-expanded={isExpanded}>
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-black text-blue-700">Bab {bab.nomor}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{bab.nama}</span>
                        <span className="hidden text-xs text-gray-400 sm:block">{semuaSoalBab.length} soal • {soalUjianBab.length} soal ujian</span>
                        <ChevronDown size={17} className={`shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180 text-blue-600" : ""}`} />
                      </button>
                      <button type="button" onClick={() => openGenerate(bab.id)} className="hidden items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 sm:flex"><Sparkles size={14} /> AI</button>
                      <button type="button" onClick={() => openCreate(bab.id)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"><Plus size={14} /> Soal</button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 border-t border-gray-100 bg-gray-50/40 p-4 sm:p-5">
                        {visibleSoal.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                            {activeTab === "ujian" && semuaSoalBab.length > 0 ? "Belum ada soal dari bab ini yang ditandai sebagai soal ujian." : "Belum ada soal untuk bab ini."}
                          </div>
                        ) : visibleSoal.map((s, idx) => (
                          <Motion.article key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }} className={`rounded-2xl border bg-white p-4 shadow-sm ${s.untuk_ujian ? "border-blue-200" : "border-gray-100"}`}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <Badge variant={s.tipe === "esai" ? "purple" : "blue"}>{s.tipe.replace("_", " ")}</Badge>
                                  {s.tingkat_kesulitan && <Badge variant="gray">{s.tingkat_kesulitan}</Badge>}
                                  {s.untuk_ujian && <Badge variant="green">Pretest & Posttest</Badge>}
                                </div>
                                <p className="text-sm font-medium leading-6 text-gray-800">{s.teks_soal}</p>
                                {s.jawaban_referensi && <p className="mt-2 text-xs text-gray-400">Referensi: {s.jawaban_referensi}</p>}
                                <div className="mt-3 flex flex-wrap gap-1">{s.konsep.map((k) => <Badge key={k} variant="green">{k}</Badge>)}</div>
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <button type="button" disabled={togglingSoal === s.id} onClick={() => handleToggleUjian(s)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${s.untuk_ujian ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}>
                                  {togglingSoal === s.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                  {s.untuk_ujian ? "Soal Ujian" : "Tandai untuk Ujian"}
                                </button>
                                <button type="button" onClick={() => openEdit(s)} className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title="Edit Soal"><Pencil size={16} /></button>
                                <button type="button" onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Hapus Soal"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </Motion.article>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Soal" : "Tambah Soal"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teks Soal</label>
            <textarea
              required
              rows={3}
              value={form.teks_soal}
              onChange={(e) => setForm({ ...form, teks_soal: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipe</label>
              <select
                value={form.tipe}
                onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-700"
              >
                <option value="isian_singkat">Isian Singkat</option>
                <option value="esai">Esai</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kesulitan</label>
              <select
                value={form.tingkat_kesulitan}
                onChange={(e) => setForm({ ...form, tingkat_kesulitan: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-700"
              >
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Jawaban Referensi (opsional)</label>
            <textarea
              rows={2}
              value={form.jawaban_referensi}
              onChange={(e) => setForm({ ...form, jawaban_referensi: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Konsep Diuji</label>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting || !form.teks_soal}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-300"
              >
                {/* {suggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Saran AI */}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
              {konsepBab.map((k) => {
                const active = form.konsep.includes(k)
                return (
                  <button
                    type="button"
                    key={k}
                    onClick={() => toggleKonsep(k)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                      active ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {k}
                    {active && <X size={10} />}
                  </button>
                )
              })}
              {konsepBab.length === 0 && (
                <p className="text-xs text-gray-400">Bab ini belum punya konsep.</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400"
          >
            {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Simpan Soal"}
          </button>
        </form>
      </Modal>

      <Modal open={generateModalOpen} onClose={closeGenerate} title="Generate Soal dengan AI">
        <div className="space-y-4">
          {generateError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle size={16} /> {generateError}
            </div>
          )}

          {!generateJobId && (
            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                LLM akan membuat draf soal berdasarkan konsep-konsep di Bab ini. Draf bisa ditinjau,
                diedit, atau dibuang sebelum disimpan.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Soal</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={generateForm.jumlah}
                  onChange={(e) => setGenerateForm({ ...generateForm, jumlah: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipe</label>
                  <select
                    value={generateForm.tipe}
                    onChange={(e) => setGenerateForm({ ...generateForm, tipe: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-700"
                  >
                    <option value="">Campuran</option>
                    <option value="isian_singkat">Isian Singkat</option>
                    <option value="esai">Esai</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kesulitan</label>
                  <select
                    value={generateForm.tingkat_kesulitan}
                    onChange={(e) => setGenerateForm({ ...generateForm, tingkat_kesulitan: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-sm font-medium text-slate-700"
                  >
                    <option value="">Campuran</option>
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generateSubmitting}
                className="w-full py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
              >
                {generateSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generateSubmitting ? "Memulai..." : "Generate"}
              </button>
            </form>
          )}

          {generateJobId && (
            <SoalGenerateReview
              jobId={generateJobId}
              babId={babId}
              onSaved={handleGenerateSaved}
              onCancel={closeGenerate}
            />
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default ManageSoal
