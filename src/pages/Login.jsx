import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { AlertCircle, ArrowRight, Eye, EyeOff, IdCard, Loader2, LockKeyhole, UserRound } from "lucide-react"
import { login } from "../api"

const Login = () => {
  const navigate = useNavigate()
  const rememberedNim = localStorage.getItem("rememberedNim") || ""
  const [nim, setNim] = useState(rememberedNim)
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedNim))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await login(nim, password)
      if (rememberMe) localStorage.setItem("rememberedNim", nim)
      else localStorage.removeItem("rememberedNim")
      localStorage.removeItem("rememberedEmail")

      sessionStorage.setItem("token", data.access_token)
      sessionStorage.setItem("user", JSON.stringify({ nama: data.nama, role: data.role }))
      const dashboardByRole = {
        admin: "/admin/dashboard",
        dosen: "/dosen/dashboard",
        mahasiswa: "/mahasiswa/dashboard",
      }
      navigate(dashboardByRole[data.role] || "/")
    } catch (err) {
      setError(err.message || "Login gagal. Periksa kembali NIM/ID dan password Anda.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8F5F0] bg-[url('/img/bg-login.png')] bg-cover bg-[position:38%_center] lg:bg-center">
      <div className="absolute inset-0 bg-white/30 sm:bg-white/15 lg:hidden" aria-hidden="true" />

      <div className="relative z-10 grid min-h-dvh grid-rows-[1fr_auto] px-3 py-4 sm:px-8 sm:py-8 lg:grid-cols-[43%_57%] lg:grid-rows-[1fr_auto] lg:px-0 lg:py-0">
        <div className="hidden lg:block" aria-hidden="true" />

        <section className="flex items-center justify-center lg:px-12 xl:px-20 2xl:px-28">
          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="w-full max-w-[540px] rounded-[24px] border border-white/90 bg-white/94 px-4 py-6 shadow-[0_18px_55px_rgba(38,54,56,0.13)] backdrop-blur-md sm:rounded-[28px] sm:px-9 sm:py-10 lg:rounded-[42px] lg:px-10 lg:py-12 xl:px-12 xl:py-14"
          >
            <header className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#F6E3CC] bg-[#FFF5E9] text-gray-900 sm:h-16 sm:w-16">
                <UserRound size={28} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-gray-900 sm:text-2xl">Selamat datang kembali!</h1>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 sm:text-[15px]">Masuk untuk melanjutkan perjalanan belajarmu</p>
              </div>
            </header>

            <AnimatePresence initial={false}>
              {error && (
                <Motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  role="alert"
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-medium text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="nim" className="ml-1 block text-xs font-bold uppercase tracking-wide text-gray-800">NIM / ID</label>
                <div className="relative">
                  <IdCard size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="nim"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan NIM atau ID akun"
                    value={nim}
                    onChange={(event) => setNim(event.target.value)}
                    className="h-14 w-full rounded-xl border border-gray-100 bg-white pl-13 pr-4 text-sm font-medium text-gray-700 shadow-[0_5px_18px_rgba(17,24,39,0.035)] outline-none transition placeholder:font-normal placeholder:text-gray-400 hover:border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:h-[58px] sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="ml-1 block text-xs font-bold uppercase tracking-wide text-gray-800">Password</label>
                <div className="relative">
                  <LockKeyhole size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-14 w-full rounded-xl border border-gray-100 bg-white pl-13 pr-13 text-sm font-medium text-gray-700 shadow-[0_5px_18px_rgba(17,24,39,0.035)] outline-none transition placeholder:font-normal placeholder:text-gray-400 hover:border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:h-[58px] sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-700"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* <div className="flex flex-col gap-2 text-xs min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between sm:text-sm">
                <label className="flex cursor-pointer items-center gap-2.5 font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-5 w-5 rounded-md border-2 border-gray-300 accent-[#0D9488]"
                  />
                  Ingat saya
                </label>
                <button type="button" className="font-semibold text-blue-700 transition hover:text-blue-800 hover:underline">Lupa password?</button>
              </div> */}

              <Motion.button
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className={`flex h-14 w-full items-center justify-center gap-4 rounded-xl text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition sm:h-[60px] sm:text-base ${
                  loading ? "cursor-not-allowed bg-gray-300 shadow-none" : "bg-blue-600 hover:bg-blue-700 hover:shadow-[0_12px_28px_rgba(13,148,136,0.26)]"
                }`}
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                ) : (
                  <>Masuk Sistem <ArrowRight size={22} strokeWidth={2.2} /></>
                )}
              </Motion.button>
            </form>
          </Motion.div>
        </section>

        <footer className="col-span-full pt-7 text-center text-[11px] leading-relaxed text-gray-600 sm:text-xs lg:absolute lg:bottom-6 lg:left-[43%] lg:right-0 lg:pt-0">
          <p>&copy; {new Date().getFullYear()} Matrikulasi Matematika KG. All rights reserved.</p>
          <p className="mt-1">Versi 1.0.0</p>
        </footer>
      </div>
    </main>
  )
}

export default Login
