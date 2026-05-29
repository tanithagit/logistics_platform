function StatusBadge({ status }) {
  const statusConfig = {
    pending:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    assigned:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
    picked_up:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
    in_transit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    delivered:  'bg-green-500/20 text-green-400 border-green-500/30',
    canceled:   'bg-red-500/20 text-red-400 border-red-500/30',
    active:     'bg-green-500/20 text-green-400 border-green-500/30',
    maintenance:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    unavailable:'bg-red-500/20 text-red-400 border-red-500/30',
    paid:       'bg-green-500/20 text-green-400 border-green-500/30',
    unpaid:     'bg-red-500/20 text-red-400 border-red-500/30',
    admin:      'bg-purple-500/20 text-purple-400 border-purple-500/30',
    driver:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
    customer:   'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const classes = statusConfig[status] ||
    'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      border ${classes}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  )
}

export default StatusBadge