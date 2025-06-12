# PBMG SmartTrade Proxy

This Vercel serverless function allows you to trigger a SmartTrade on 3Commas using a secure webhook.

## Setup

1. Upload this project to Vercel.
2. Add the following environment variables:

- `API_KEY`: Your 3Commas API Key
- `API_SECRET`: Your 3Commas API Secret

3. Deploy.

## Webhook

Make a POST request to:

```
https://<your-vercel-project>.vercel.app/api/fire
```

With the following JSON body:

```json
{
  "action": "pbmg_trigger"
}
```