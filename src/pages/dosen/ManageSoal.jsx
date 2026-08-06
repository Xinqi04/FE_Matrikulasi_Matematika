import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Pencil, Sparkles, Loader2, X, AlertCircle } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Modal from "../../components/Modal"
import Badge from "../../components/Badge"
import { getModul, getSoalBab, buatSoal, updateSoal, hapusSoal, suggestKonsep } from "../../api"

const emptyForm = { teks_soal: "", tipe: "isian_singkat", jawaban_referensi: "", tingkat_kesulitan: "sedang", konsep: [] }

const ManageSoal = () => {
  const [modul, setModul] = useState([])
  const [modulId, setModulId] = useState("")
  const [babId, setBabId] = useState("")
  const [soal, setSoal] = useState([])
  const [loadingSoal, setLoadingSoal] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [error, setError] = useState("")

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

  const babOptions = useMemo(() => {
    const m = modul.find((x) => x.id === modulId)
    if (!m) return []
    return m.bab.map((bab) => ({ id: bab.id, label: `Bab ${bab.nomor}. ${bab.nama}` }))
  }, [modul, modulId])

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
  }

  const loadSoal = (id) => {
    if (!id) { setSoal([]); return }
    setLoadingSoal(true)
    getSoalBab(id).then(setSoal).catch(console.error).finally(() => setLoadingSoal(false))
  }

  useEffect(() => { loadSoal(babId) }, [babId])

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

  const openCreate = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setError("")
    setModalOpen(true)
  }

  const openEdit = (s) => {
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
      loadSoal(babId)
    } catch (err) {
      setError(err.message || "Gagal menyimpan soal")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (soalId) => {
    await hapusSoal(soalId)
    loadSoal(babId)
  }

  return (
    <DashboardLayout role="dosen" title="Kelola Soal" subtitle="Buat dan kelola soal per Bab.">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 grid sm:grid-cols-2 gap-4">
        <div>
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
        </div>
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Bab</label>
          <select
            value={babId}
            onChange={(e) => setBabId(e.target.value)}
            disabled={!modulId}
            className="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{modulId ? "-- Pilih Bab --" : "Pilih modul dulu"}</option>
            {babOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {babId && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all"
            >
              <Plus size={16} /> Tambah Soal
            </button>
          </div>

          <div className="space-y-3">
            {loadingSoal ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Memuat soal...</div>
            ) : soal.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">Belum ada soal untuk bab ini.</div>
            ) : soal.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={s.tipe === "esai" ? "purple" : "blue"}>{s.tipe.replace("_", " ")}</Badge>
                      {s.tingkat_kesulitan && <Badge variant="gray">{s.tingkat_kesulitan}</Badge>}
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{s.teks_soal}</p>
                    {s.jawaban_referensi && (
                      <p className="text-xs text-gray-400 mt-2">Referensi: {s.jawaban_referensi}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {s.konsep.map((k) => <Badge key={k} variant="green">{k}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Soal"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Soal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
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
    </DashboardLayout>
  )
}

export default ManageSoal
