import { useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard, BookOpen, FileQuestion, PenLine,
  ClipboardList, LogOut, X, Users, UserCog, Briefcase, GraduationCap,
} from "lucide-react"

const dosenMenu = [
  { name: "Dashboard", path: "/dosen/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Kelola Materi", path: "/dosen/materi", icon: <BookOpen size={20} /> },
  { name: "Kelola Soal", path: "/dosen/soal", icon: <FileQuestion size={20} /> },
  { name: "Penilaian", path: "/dosen/penilaian", icon: <ClipboardList size={20} /> },
  { name: "Kelola Mahasiswa", path: "/dosen/mahasiswa", icon: <Users size={20} /> },
  { name: "Kelola Dosen", path: "/dosen/dosen", icon: <UserCog size={20} /> },
  { name: "Riwayat Proses", path: "/dosen/jobs", icon: <Briefcase size={20} /> },
]

const mahasiswaMenu = [
  { name: "Dashboard", path: "/mahasiswa/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Ujian", path: "/mahasiswa/ujian", icon: <PenLine size={20} /> },
]

const Sidebar = ({ isOpen, setIsOpen, role = "dosen" }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = role === "mahasiswa" ? mahasiswaMenu : dosenMenu
  const title = role === "mahasiswa" ? "Dashboard Mahasiswa" : "Dashboard Dosen"

  const handleLogout = () => {
    sessionStorage.clear()
    navigate("/")
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
        w-64 lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg shrink-0 flex items-center justify-center text-white">
              {role === "mahasiswa" ? <GraduationCap size={18} /> : <LayoutDashboard size={18} />}
            </div>
            <span className="text-base leading-tight">{title}</span>
          </h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-white">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
