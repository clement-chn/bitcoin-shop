import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const USER_ID = 'user-123'
const API = 'http://localhost:3000'

export default function NewOrder() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await axios.post(`${API}/orders`, {
        userId: USER_ID,
        amountEur: parseFloat(amount)
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Acheter du BTC</h1>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 max-w-md">
        <label className="text-gray-400 text-sm block mb-2">Montant en EUR</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="100"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-orange-400"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Traitement...' : 'Acheter'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 font-medium mb-2">Ordre créé ✅</p>
            <p className="text-sm text-gray-400">Montant : <span className="text-white">{result.amountEur} €</span></p>
            <p className="text-sm text-gray-400">BTC estimé : <span className="text-orange-400">{result.amountBtc?.toFixed(8)} ₿</span></p>
            <p className="text-sm text-gray-400">Prix BTC : <span className="text-white">{result.btcPrice?.toLocaleString()} €</span></p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-3 text-sm text-orange-400 hover:underline"
            >
              Voir mes ordres →
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}