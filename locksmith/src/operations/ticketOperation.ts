import Dispatcher from '../fulfillment/dispatcher'

export const sendTicketByEmail = async (
  network: number,
  lockAddress: string,
  tokenId: string,
  recipient?: string
): Promise<string> => {
  const dispatcher = new Dispatcher()
  const [payload, signature] = await dispatcher.signToken(
    network,
    lockAddress,
    tokenId
  )

  // Then, create the QR code
  const url = new URL(`${window.location.origin}/verification`)
  const data = encodeURIComponent(payload)
  const sig = encodeURIComponent(signature)
  url.searchParams.append('data', data)
  url.searchParams.append('sig', sig)

  return 'cool'
}

export default {
  sendTicketByEmail,
}
