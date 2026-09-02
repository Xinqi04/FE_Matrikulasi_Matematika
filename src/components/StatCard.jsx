const StatCard = ({ title, value, icon, color = "bg-blue-50" }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:gap-4 md:p-6">
    <div className={`p-3 md:p-4 rounded-xl shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs md:text-sm text-gray-500 font-medium truncate">{title}</p>
      <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

export default StatCard
