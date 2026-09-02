import { useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard, BookOpen, FileQuestion, PenLine,
  ClipboardList, LogOut, X, Users, UserCog, Briefcase, GraduationCap, ShieldCheck,
} from "lucide-react"

const dosenMenu = [
  { name: "Dashboard", path: "/dosen/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Kelola Materi", path: "/dosen/materi", icon: <BookOpen size={20} /> },
  { name: "Kelola Soal", path: "/dosen/soal", icon: <FileQuestion size={20} /> },
  { name: "Penilaian", path: "/dosen/penilaian", icon: <ClipboardList size={20} /> },
  { name: "Mahasiswa Terdaftar", path: "/dosen/mahasiswa", icon: <Users size={20} /> },
  { name: "Riwayat Proses", path: "/dosen/jobs", icon: <Briefcase size={20} /> },
]

const mahasiswaMenu = [
  { name: "Dashboard", path: "/mahasiswa/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Pilih Modul", path: "/mahasiswa/ujian", icon: <PenLine size={20} /> },
]

const adminMenu = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Kelola Mahasiswa", path: "/admin/mahasiswa", icon: <GraduationCap size={20} /> },
  { name: "Kelola Dosen", path: "/admin/dosen", icon: <UserCog size={20} /> },
  { name: "Kelola Admin", path: "/admin/admin", icon: <ShieldCheck size={20} /> },
]

const Sidebar = ({ isOpen, setIsOpen, role = "dosen" }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = role === "admin" ? adminMenu : role === "mahasiswa" ? mahasiswaMenu : dosenMenu
  const title = "MathDasar"

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
        fixed left-0 top-0 z-50 h-dvh w-[min(18rem,86vw)] border-r border-gray-200 bg-white shadow-[4px_0_24px_rgba(17,24,39,0.025)] transition-transform duration-300 ease-in-out sm:w-64 lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-xl shrink-0 flex items-center justify-center text-white shadow-sm">
              {role === "mahasiswa" ? <GraduationCap size={18} /> : role === "admin" ? <ShieldCheck size={18} /> : <LayoutDashboard size={18} />}
            </div>
            <span className="text-base leading-tight font-display">{title}</span>
          </h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="h-[calc(100dvh-158px)] flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-[inset_3px_0_0_#0D9488]"
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

        <div className="absolute bottom-0 left-0 w-full border-t border-gray-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
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
