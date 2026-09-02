import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[85dvh] sm:rounded-3xl sm:p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky -top-4 z-10 mb-5 flex items-center justify-between gap-3 border-b border-gray-100 bg-white py-3 sm:static sm:mb-6 sm:border-0 sm:py-0">
            <h2 className="min-w-0 text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
            <button onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Tutup dialog">
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default Modal
