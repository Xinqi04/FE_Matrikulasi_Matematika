import { useState } from "react"
import { Menu, User, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"

const DashboardLayout = ({ role = "dosen", title, subtitle, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(sessionStorage.getItem("user") || "{}")

  const handleLogout = () => {
    sessionStorage.clear()
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-[#F6F7F8] font-sans text-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role={role} />

      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex justify-between items-center">
          <h1 className="font-display font-semibold text-blue-700">MathDasar</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="hidden lg:flex justify-end px-8 pt-5">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl pl-2.5 pr-4 py-2 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <User size={16} />
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-bold text-gray-800">{user.nama || "Pengguna"}</p>
                <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {(title || subtitle) && (
            <div className="mb-8 max-w-3xl">
              {title && <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
