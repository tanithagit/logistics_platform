function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6
                    hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-white text-3xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default StatCard