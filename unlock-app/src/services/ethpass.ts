import { networks } from '@unlock-protocol/networks'
import { storage } from '~/config/storage'

export enum Platform {
  APPLE = 'apple',
  GOOGLE = 'google',
}

export const isEthPassSupported = (network: number) => {
  // Check `chain` param on https://docs.ethpass.xyz/api-reference#tag/passes
  return [1, 5, 137, 80001, 10, 69, 42161, 421611].indexOf(network) > -1
}

export const createWalletPass = async ({
  signature,
  lockAddress,
  tokenId,
  // image, ethPass does not support SVG for now...
  signatureMessage,
  network,
  platform,
}: any) => {
  let pass = {}
  if (platform === Platform.APPLE) {
    pass = {
      description: 'ETHPass Sample Pass',
      auxiliaryFields: [],
      backFields: [],
      headerFields: [
        {
          key: 'header',
          value: 'DEMO PASS',
        },
      ],
      primaryFields: [],
      secondaryFields: [
        {
          key: 'secondary1',
          label: 'Lock Address',
          value: `${lockAddress.slice(0, 6)}...${lockAddress.slice(
            lockAddress.length - 4
          )}`,
          textAlignment: 'PKTextAlignmentLeft',
        },
        {
          key: 'secondary2',
          label: 'Key ID',
          value: tokenId,
          textAlignment: 'PKTextAlignmentNatural',
        },
        {
          key: 'secondary3',
          label: 'Network',
          value: networks[network].name,
          textAlignment: 'PKTextAlignmentNatural',
        },
      ],
    }
  } else {
    pass = {
      messages: [],
    }
  }

  // Get signed QR Code for verification!
  const verificationResponse = await storage.ticketVerificationUrl(
    network,
    lockAddress,
    tokenId
  )
  if (!verificationResponse.data.verificationUrl) {
    throw new Error('Failed to retrieve verification URL')
  }
  const verificationUrl = verificationResponse.data.verificationUrl

  const body = JSON.stringify({
    signature,
    signatureMessage,
    pass, // customize me?
    platform,
    chain: {
      network: network,
      name: 'evm',
    },
    nft: {
      contractAddress: lockAddress,
      tokenId,
    },
    barcode: {
      redirect: {
        url: verificationUrl,
      },
    },
    image: 'https://app.unlock-protocol.com/images/unlock.png', // Placeholder until EthPass supports SVGs
  })

  const opts = {
    method: 'POST',
    headers: {
      'X-API-KEY': 'sk_live_kCHr20HfJ73Xe3Nfmzr83Yqe4qoxxDwX',
      'Content-Type': 'application/json',
    },
    body,
  }
  const response = await fetch('https://api.ethpass.xyz/api/v0/passes', opts)
  if (response.status === 200) {
    const { fileURL } = await response.json()
    return fileURL
  } else {
    throw new Error('EthPass pass generation failed!')
  }
}
