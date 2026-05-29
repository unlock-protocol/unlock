import normalizer from '../utils/normalizer'

const HUDDLE_CREATE_ROOM_URL = 'https://api.huddle01.com/api/v1/create-room'

const HUDDLE_CHAIN_BY_NETWORK: Record<number, string> = {
  1: 'ETHEREUM',
  10: 'OPTIMISM',
  56: 'BSC',
  100: 'GNOSIS',
  137: 'POLYGON',
  324: 'ZKSYNC',
  8453: 'BASE',
  42161: 'ARBITRUM',
  42220: 'CELO',
  43114: 'AVALANCHE',
  59144: 'LINEA',
  534352: 'SCROLL',
  11155111: 'ETHEREUM',
  421614: 'ARBITRUM',
  84532: 'BASE',
  11155420: 'OPTIMISM',
}

export interface CreateTokenGatedHuddleRoomOptions {
  lockAddress: string
  network: number
  title: string
  hostWallets?: string[]
}

interface BuildTokenGatedRoomPayloadOptions {
  chain: string
  hostWallets?: string[]
  lockAddress: string
  title: string
}

interface HuddleCreateRoomResponse {
  data?: {
    roomId?: string
  }
  roomId?: string
  message?: string
}

export const getHuddleChainForNetwork = (network: number) => {
  return HUDDLE_CHAIN_BY_NETWORK[network]
}

export const buildHuddleRoomUrl = ({
  iframeBaseUrl,
  projectId,
  roomId,
}: {
  iframeBaseUrl: string
  projectId?: string
  roomId: string
}) => {
  const url = new URL(roomId, `${iframeBaseUrl.replace(/\/$/, '')}/`)
  if (projectId) {
    url.searchParams.set('projectId', projectId)
  }
  return url.toString()
}

export const buildTokenGatedRoomPayload = ({
  chain,
  hostWallets,
  lockAddress,
  title,
}: BuildTokenGatedRoomPayloadOptions) => {
  const normalizedLockAddress = normalizer.ethereumAddress(lockAddress)

  return {
    chain,
    contractAddress: [normalizedLockAddress],
    ...(hostWallets?.length ? { hostWallets } : {}),
    roomType: 'VIDEO',
    title,
    tokenType: 'ERC721',
  }
}

export const createTokenGatedHuddleRoom = async ({
  hostWallets,
  lockAddress,
  network,
  title,
}: CreateTokenGatedHuddleRoomOptions) => {
  const { default: config } = await import('../config/config')
  const { apiKey, iframeBaseUrl, projectId } = config.huddle
  if (!apiKey) {
    throw new Error('Huddle01 is not configured')
  }

  const chain = getHuddleChainForNetwork(network)
  if (!chain) {
    throw new Error(`Huddle01 does not support network ${network}`)
  }

  const response = await fetch(HUDDLE_CREATE_ROOM_URL, {
    method: 'POST',
    body: JSON.stringify(
      buildTokenGatedRoomPayload({
        chain,
        hostWallets,
        lockAddress,
        title,
      })
    ),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  })

  const body = (await response.json().catch(() => ({}))) as
    | HuddleCreateRoomResponse
    | undefined

  if (!response.ok) {
    throw new Error(body?.message || 'Huddle01 room creation failed')
  }

  const roomId = body?.data?.roomId || body?.roomId
  if (!roomId) {
    throw new Error('Huddle01 room creation response did not include roomId')
  }

  return {
    roomId,
    roomUrl: buildHuddleRoomUrl({ iframeBaseUrl, projectId, roomId }),
  }
}
