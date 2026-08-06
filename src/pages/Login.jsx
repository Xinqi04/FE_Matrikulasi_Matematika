import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { login } from "../api"

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await login(email, password)
      sessionStorage.setItem("token", data.access_token)
      sessionStorage.setItem("user", JSON.stringify({ nama: data.nama, role: data.role }))

      navigate(data.role === "dosen" ? "/dosen/dashboard" : "/mahasiswa/dashboard")
    } catch (err) {
      setError(err.message || "Login gagal. Periksa kembali email dan password anda.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden p-4">

      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[450px] z-10"
      >
        {/* LOGO & BRANDING */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-200 mb-6"
          >
            <BrainCircuit className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Matrikulasi</h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">Matematika Berbasis Knowledge Graph</p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white relative">

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                  <AlertCircle size={18} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
                required
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[2rem] font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-xl ${
                loading
                ? "bg-slate-100 text-slate-400"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Masuk Sistem <ArrowRight size={20} strokeWidth={3} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-[11px] font-medium mt-8">
          &copy; {new Date().getFullYear()} Matrikulasi Matematika KG. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}

export default Login
