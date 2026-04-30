import { useEffect, useState } from 'react'
import axios from 'axios'

const USER_ID = 'user-123'
const API = 'http://localhost:3000'

export default function Dashboard() {
  const [wallet, setWallet] = useState(null)
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, assetRes] = await Promise.all([
          axios.get(`${API}/wallets/${USER_ID}`),
          axios.get(`${API}/assets/${USER_ID}`)
        ])
        setWallet(walletRes.data)
        setAsset(assetRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-gray-400">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon portefeuille</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Solde EUR</p>
          <p className="text-3xl font-bold text-white">
            {wallet ? `${wallet.balance_eur.toFixed(2)} €` : 'N/A'}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Solde BTC</p>
          <p className="text-3xl font-bold text-orange-400">
            {asset ? `${asset.balance_btc.toFixed(8)} ₿` : '0.00000000 ₿'}
          </p>
        </div>
      </div>
    </div>
  )
}