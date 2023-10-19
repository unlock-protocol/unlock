import { networks } from '@unlock-protocol/networks'
import { minifyAddress } from '@unlock-protocol/ui'
import { config } from '~/config/app'
import { storage } from '~/config/storage'

export enum Platform {
  APPLE = 'apple',
  GOOGLE = 'google',
}

interface PassRequest {
  layout: any
  wallet: {
    address: string
    chain: { network: number; name: string }
  }
  nft?: { contractAddress: string; tokenId: string }
  barcode: { redirect: { url: string } }
  image: string
}

export const isEthPassSupported = (network: number) => {
  // Check `chain` param on https://docs.ethpass.xyz/api-reference#tag/passes
  return [
    1, 5, 137, 80001, 10, 56, 100, 69, 84531, 42161, 421611, 11155111,
  ].includes(network)
}

export const applePass = (
  name: string,
  lockAddress: string,
  tokenId: string,
  network: number
) => {
  return {
    description: 'Unlock Protocol',
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
  lockAddress,
  tokenId,
  signedByOwner,
  network,
  owner,
  platform,
}: any) => {
  const [keyMetadataResponse, lockMetadataResponse, verificationResponse] =
    await Promise.all([
      storage.keyMetadata(network!, lockAddress!, tokenId),
      storage.lockMetadata(network, lockAddress),
      storage.ticketVerificationUrl(network, lockAddress, tokenId),
    ])

  const keyMetadata = keyMetadataResponse.data
  const lockMetadata = lockMetadataResponse.data

  const verificationUrl = verificationResponse.data?.verificationUrl

  if (!verificationUrl) {
    throw new Error('Failed to retrieve verification URL')
  }

  const passRequest: PassRequest = {
    layout: {
      universal: {
        logoText: lockMetadata!.name,
        description: lockMetadata!.description,
        headerFields: [
          {
            label: 'Name',
            value: lockMetadata!.name,
          },
        ],
        primaryFields: [
          {
            label: 'Lock Address',
            value: minifyAddress(lockAddress),
            alignment: 'left',
          },
          {
            label: 'Key ID',
            value: tokenId,
            alignment: 'middle',
          },
          {
            label: 'Network',
            value: networks[network].name,
            alignment: 'right',
          },
        ],
      },
    },
    wallet: {
      address: owner,
      chain: {
        network: network,
        name: 'evm',
      },
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
    image: keyMetadata!.image,
  }
  if (!signedByOwner) {
    // If not signed by the owner, we can't send the nft to ethpass as it would verify ownership
    delete passRequest.nft
  }

  const opts = {
    method: 'POST',
    headers: {
      'X-API-KEY': config.ethPassApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passRequest),
  }
  const response = await fetch('https://api.ethpass.xyz/api/v0/passes', opts)
  if (response.ok) {
    const json = await response.json()
    return json.distribution[platform].url
  } else {
    throw new Error('EthPass pass generation failed!')
  }
}
