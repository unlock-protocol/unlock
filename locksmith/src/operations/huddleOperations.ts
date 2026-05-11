const HUDDLE_CREATE_ROOM_URL =
  'https://api.huddle01.com/api/v2/sdk/rooms/create-room'
const HUDDLE_IFRAME_URL = 'https://iframe.huddle01.com'

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

interface TokenGatedRoomPayloadOptions {
  chain: string
  lockAddress: string
  title: string
}

export interface CreateTokenGatedHuddleRoomOptions {
  lockAddress: string
  network: number
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

export const buildTokenGatedRoomPayload = ({
  chain,
  lockAddress,
  title,
}: TokenGatedRoomPayloadOptions) => {
  return {
    roomLocked: false,
    title,
    metadata: {
      title,
      tokenGatingInfo: {
        tokenGatingConditions: [
          {
            chain,
            contractAddress: lockAddress,
            tokenType: 'ERC721',
          },
        ],
      },
    },
  }
}

export const buildHuddleRoomUrl = (roomId: string, projectId: string) => {
  const url = new URL(roomId, `${HUDDLE_IFRAME_URL}/`)
  url.searchParams.set('projectId', projectId)
  return url.toString()
}

export const createTokenGatedHuddleRoom = async ({
  lockAddress,
  network,
  title,
}: CreateTokenGatedHuddleRoomOptions) => {
  const { default: config } = await import('../config/config')
  const { apiKey, projectId } = config.huddle
  if (!apiKey || !projectId) {
    throw new Error('Huddle is not configured')
  }

  const chain = getHuddleChainForNetwork(network)
  if (!chain) {
    throw new Error(`Huddle does not support network ${network}`)
  }

  const response = await fetch(HUDDLE_CREATE_ROOM_URL, {
    method: 'POST',
    body: JSON.stringify(
      buildTokenGatedRoomPayload({
        chain,
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
    throw new Error(body?.message || 'Huddle room creation failed')
  }

  const roomId = body?.data?.roomId || body?.roomId
  if (!roomId) {
    throw new Error('Huddle room creation response did not include roomId')
  }

  return {
    roomId,
    roomUrl: buildHuddleRoomUrl(roomId, projectId),
  }
}
