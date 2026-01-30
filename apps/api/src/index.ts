import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PinataSDK } from 'pinata'

const app = new Hono()

app.use(cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/presigned_url', async (c) => {
  // Handle Auth

  const pinata = new PinataSDK({
    pinataJwt: String(process.env.PINATA_JWT),
    pinataGateway: String(process.env.GATEWAY_URL),
  })

  const url = await pinata.upload.public.createSignedURL({
    expires: 60, // Last for 60 seconds
  })

  return c.json({ url }, { status: 200 })
})

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
