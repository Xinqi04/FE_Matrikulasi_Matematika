const StatCard = ({ title, value, icon, color = "bg-blue-50" }) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
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
