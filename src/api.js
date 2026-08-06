// Base URL for the FastAPI backend
const BASE_URL = "http://localhost:8000"

function getToken() {
  return sessionStorage.getItem("token") || ""
}

async function request(method, path, body = null, { isForm = false } = {}) {
  const opts = { method, headers: {} }

  const token = getToken()
  if (token) opts.headers.Authorization = `Bearer ${token}`

  if (body) {
    if (isForm) {
      opts.body = body
    } else {
      opts.headers["Content-Type"] = "application/json"
      opts.body = JSON.stringify(body)
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, opts)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Auth ────────────────────────────────────────────────────────
export const login = (email, password) =>
  request("POST", "/auth/login", { email, password })

export const getMe = () => request("GET", "/auth/me")

export const changePassword = (password_lama, password_baru) =>
  request("PUT", "/auth/me/password", { password_lama, password_baru })

// ── Knowledge Graph (public) ───────────────────────────────────
export const getModul = () => request("GET", "/kg/modul")
export const getKonsep = () => request("GET", "/kg/konsep")
export const getVideo = () => request("GET", "/kg/video")

// ── Dosen: manajemen user ──────────────────────────────────────
export const getDosenDashboard = () => request("GET", "/dosen/dashboard")

export const listMahasiswa = () => request("GET", "/dosen/mahasiswa")
export const buatMahasiswa = (data) => request("POST", "/dosen/mahasiswa", data)
export const setAktifMahasiswa = (userId, aktif) =>
  request("PUT", `/dosen/mahasiswa/${userId}`, { aktif })
export const getModulMahasiswa = (userId) => request("GET", `/dosen/mahasiswa/${userId}/modul`)
export const setModulMahasiswa = (userId, modulIds) =>
  request("PUT", `/dosen/mahasiswa/${userId}/modul`, { modul_ids: modulIds })

export const buatDosen = (data) => request("POST", "/dosen/dosen", data)

// ── Dosen: soal ─────────────────────────────────────────────────
export const suggestKonsep = (bab_id, teks_soal) =>
  request("POST", "/dosen/soal/suggest-konsep", { bab_id, teks_soal })

export const buatSoal = (data) => request("POST", "/dosen/soal", data)
export const getSoalBab = (babId) => request("GET", `/dosen/soal?bab_id=${babId}`)
export const updateSoal = (soalId, data) => request("PUT", `/dosen/soal/${soalId}`, data)
export const hapusSoal = (soalId) => request("DELETE", `/dosen/soal/${soalId}`)

// ── Dosen: penilaian ────────────────────────────────────────────
export const getPenilaian = (babId, status) => {
  const params = new URLSearchParams()
  if (babId) params.set("bab_id", babId)
  if (status) params.set("status", status)
  const qs = params.toString()
  return request("GET", `/dosen/penilaian${qs ? `?${qs}` : ""}`)
}
export const beriNilai = (jawabanId, nilai) =>
  request("PUT", `/dosen/penilaian/${jawabanId}`, { nilai })
export const beriNilaiBatch = (items) =>
  request("POST", "/dosen/penilaian/batch", { nilai: items })

// ── Dosen: materi (PDF & YouTube) ──────────────────────────────
export const extractPdf = (file, nama_domain) => {
  const form = new FormData()
  form.append("file", file)
  form.append("nama_domain", nama_domain)
  return request("POST", "/pdf/extract", form, { isForm: true })
}

export const confirmPdfExtraction = (job_id, unit) =>
  request("POST", "/pdf/confirm", { job_id, unit })

export const discardPdfDraft = (jobId) => request("DELETE", `/pdf/draft/${jobId}`)
export const hapusModul = (modulId) => request("DELETE", `/pdf/modul/${modulId}`)

export const classifyYoutube = (link, materi_query) =>
  request("POST", "/youtube/classify", { link, materi_query })

export const confirmYoutubeClassification = (job_id, konsep) =>
  request("POST", "/youtube/confirm", { job_id, konsep })

export const discardYoutubeDraft = (jobId) => request("DELETE", `/youtube/draft/${jobId}`)

export const updateVideo = (videoId, data) => request("PUT", `/youtube/video/${videoId}`, data)
export const hapusVideo = (videoId) => request("DELETE", `/youtube/video/${videoId}`)

// ── Jobs ────────────────────────────────────────────────────────
export const listJobs = () => request("GET", "/jobs")
export const getJob = (jobId) => request("GET", `/jobs/${jobId}`)

// ── Mahasiswa ───────────────────────────────────────────────────
export const getMahasiswaDashboard = () => request("GET", "/mahasiswa/dashboard")
export const getSoalMahasiswa = (babId) => request("GET", `/mahasiswa/bab/${babId}/soal`)
export const submitJawaban = (babId, jawaban) =>
  request("POST", `/mahasiswa/bab/${babId}/jawaban`, { jawaban })
export const getHasilBab = (babId) => request("GET", `/mahasiswa/bab/${babId}/hasil`)
