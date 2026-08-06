import { useEffect, useState } from "react"
import { ChevronDown, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import Badge from "../../components/Badge"
import PdfExtractionReview from "../../components/PdfExtractionReview"
import YoutubeClassificationReview from "../../components/YoutubeClassificationReview"
import { listJobs, getJob } from "../../api"

const STATUS_ICON = {
  pending: <Clock size={16} className="text-gray-400" />,
  running: <Loader2 size={16} className="text-blue-600 animate-spin" />,
  done: <CheckCircle2 size={16} className="text-green-600" />,
  error: <XCircle size={16} className="text-red-600" />,
}

const STATUS_VARIANT = {
  pending: "gray",
  running: "blue",
  done: "green",
  error: "red",
}

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    listJobs().then(setJobs).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
  }, [])

  const toggle = async (jobId) => {
    if (expanded === jobId) {
      setExpanded(null)
      return
    }
    setExpanded(jobId)
    const detail = await getJob(jobId)
    setJobs((prev) => prev.map((j) => (j.id === jobId ? detail : j)))
  }

  return (
    <DashboardLayout role="dosen" title="Riwayat Proses" subtitle="Status ekstraksi PDF dan klasifikasi video YouTube.">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Memuat data...</div>
        ) : jobs.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Belum ada proses yang dijalankan.</div>
        ) : jobs.map((job) => (
          <div key={job.id}>
            <button
              onClick={() => toggle(job.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                {STATUS_ICON[job.status]}
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800 capitalize truncate">{job.type.replace(/_/g, " ")}</p>
                  <p className="text-[11px] text-gray-400">{new Date(job.created_at).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {(job.type === "pdf_extraction" || job.type === "youtube_classification") && job.result?.status_penyimpanan === "menunggu_konfirmasi" && (
                  <Badge variant="orange">Menunggu Konfirmasi</Badge>
                )}
                <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === job.id ? "rotate-180" : ""}`} />
              </div>
            </button>

            {expanded === job.id && (
              <div className="px-4 pb-4">
                {job.type === "pdf_extraction" ? (
                  <PdfExtractionReview jobId={job.id} onSaved={load} />
                ) : job.type === "youtube_classification" ? (
                  <YoutubeClassificationReview jobId={job.id} onSaved={load} />
                ) : (
                  <>
                    {job.log?.length > 0 && (
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 max-h-48 overflow-y-auto text-[12px] font-mono text-slate-500 space-y-1">
                        {job.log.map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                    )}
                    {job.error && <p className="text-sm text-red-600 font-medium mt-2">{job.error}</p>}
                    {job.result && (
                      <pre className="mt-2 bg-slate-900 text-slate-100 rounded-xl p-3 text-[11px] overflow-x-auto">
                        {JSON.stringify(job.result, null, 2)}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default Jobs
