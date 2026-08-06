const VARIANTS = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  orange: "bg-orange-50 text-orange-700",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-50 text-purple-700",
}

const Badge = ({ children, variant = "gray" }) => (
  <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg ${VARIANTS[variant] || VARIANTS.gray}`}>
    {children}
  </span>
)

export default Badge
