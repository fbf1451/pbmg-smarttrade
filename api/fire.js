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

  const API_KEY = "15e4ae935b4d49f6a9429f41112291adf55dc00ce9c642e7bae83c8ca6ccd9d3";
  const API_SECRET = "7c9d128e108524819b8a785c80eb303af2adeba18402868965b3e6bf77a6819f1ef3106a0985edaa5a4a9814e3da382907463f0ef62145d19fe483c2ec327f0f82a05316ce81fc2331c77c2a54e5c3e26fc1bff3764bfac237830726c644337733bee3e5";


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

