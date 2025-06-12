import { buffer } from 'micro'
import crypto from 'crypto'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' })
  }

  const rawBody = await buffer(req)
  const body = JSON.parse(rawBody.toString())

  if (body.action !== 'pbmg_trigger') {
    return res.status(400).json({ message: 'Invalid action' })
  }

  const API_KEY = process.env.API_KEY
  const API_SECRET = process.env.API_SECRET

  const payload = {
    account_id: 33208734,
    pair: "ETH_USDT",
    position: { type: "buy_market", units: { value: 0.015 } },
    take_profit: {
      enabled: true,
      steps: [
        { percent: 2.0, amount_percent: 33.0 },
        { percent: 4.0, amount_percent: 34.0 },
        { percent: 6.0, amount_percent: 33.0, trailing: { enabled: true, percent: 1.0 } }
      ]
    },
    stop_loss: {
      enabled: true,
      percent: -2.5,
      trailing: false,
      stop_loss_timeout_enabled: false
    }
  }

  const requestPath = "/public/api/ver1/smart_trades/create_simple_buy"
  const signaturePayload = requestPath + JSON.stringify(payload)
  const signature = crypto.createHmac("sha256", API_SECRET).update(signaturePayload).digest("hex")

  try {
    const response = await axios.post(`https://api.3commas.io${requestPath}`, payload, {
      headers: {
        APIKEY: API_KEY,
        Signature: signature,
        "Content-Type": "application/json"
      }
    })

    return res.status(200).json({ status: "✅ SmartTrade placed!", data: response.data })
  } catch (err) {
    return res.status(500).json({ status: "❌ Error", message: err.response?.data || err.message })
  }
}

