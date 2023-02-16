import { networks } from '@unlock-protocol/networks'
import { minifyAddress } from '@unlock-protocol/ui'
import { storage } from '~/config/storage'

export enum Platform {
  APPLE = 'apple',
  GOOGLE = 'google',
}

export const isEthPassSupported = (network: number) => {
  // Check `chain` param on https://docs.ethpass.xyz/api-reference#tag/passes
  return [1, 5, 137, 80001, 10, 69, 42161, 421611].indexOf(network) > -1
}

export const applePass = (
  name: string,
  lockAddress: string,
  tokenId: string,
  network: number
) => {
  return {
    description: 'ETHPass Sample Pass',
    auxiliaryFields: [],
    backFields: [],
    headerFields: [
      {
        key: 'header',
        value: name,
      },
    ],
    primaryFields: [],
    secondaryFields: [
      {
        key: 'secondary1',
        label: 'Lock Address',
        value: minifyAddress(lockAddress),
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
}

export const createWalletPass = async ({
  signature,
  lockAddress,
  tokenId,
  name,
  image,
  signatureMessage,
  network,
  platform,
}: any) => {
  let pass = {}
  if (platform === Platform.APPLE) {
    pass = applePass(name, lockAddress, tokenId, network)
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
  const verificationUrl = verificationResponse.data?.verificationUrl

  if (!verificationUrl) {
    throw new Error('Failed to retrieve verification URL')
  }

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
    image,
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
  if (response.ok) {
    const { fileURL } = await response.json()
    return fileURL
  } else {
    throw new Error('EthPass pass generation failed!')
  }
}
