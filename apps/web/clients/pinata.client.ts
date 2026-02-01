import { PinataSDK } from 'pinata'

const pinataClient = new PinataSDK({
  pinataJwt: '',
  pinataGateway: String(process.env.NEXT_PUBLIC_GATEWAY_URL),
})

export default pinataClient
