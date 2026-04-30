import { useEffect, useState } from 'react'
import axios from 'axios'

const USER_ID = 'user-123'
const API = 'http://localhost:3000'

const statusConfig = {
  PENDING: { label: 'En cours', color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700' },
  COMPLETED: { label: 'Validé', color: 'text-green-400 bg-green-900/30 border-green-700' },
  FAILED: { label: 'Échoué', color: 'text-red-400 bg-red-900/30 border-red-700' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/${USER_ID}`)
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // Polling toutes les 3 secondes pour le suivi en temps réel
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <p className="text-gray-400">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes ordres</h1>
      {orders.length === 0 ? (
        <p className="text-gray-400">Aucun ordre pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig.PENDING
            return (
              <div key={order.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-gray-500 text-xs">{order.created_at}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400">Montant EUR</p>
                    <p className="text-white font-medium">{order.amount_eur.toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Montant BTC</p>
                    <p className="text-orange-400 font-medium">{order.amount_btc.toFixed(8)} ₿</p>
                  </div>
                </div>
                {order.reason && (
                  <p className="text-red-400 text-xs mt-2">Raison : {order.reason}</p>
                )}
                <p className="text-gray-600 text-xs mt-2 truncate">ID : {order.correlation_id}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}