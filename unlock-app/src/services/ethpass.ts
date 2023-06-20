import { networks } from '@unlock-protocol/networks'
import { minifyAddress } from '@unlock-protocol/ui'
import { config } from '~/config/app'
import { storage } from '~/config/storage'

export enum Platform {
  APPLE = 'apple',
  GOOGLE = 'google',
}

interface PassRequest {
  signature: string
  signatureMessage: string
  pass: any
  platform: Platform
  templateId: string
  chain: { network: number; name: string }
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
  signature,
  lockAddress,
  tokenId,
  name,
  image,
  signatureMessage,
  signedByOwner,
  network,
  platform,
}: any) => {
  let pass = {}
  if (platform === Platform.APPLE) {
    pass = applePass(name, lockAddress, tokenId, network)
  } else {
    pass = {
      logo: {
        sourceUri: {
          uri: 'https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/logo/%C9%84nlock-Logo-monogram-black.png',
        },
      },
      hexBackgroundColor: '#FFF7E8',
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Unlock',
        },
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: 'Name',
        },
      },
      header: {
        defaultValue: {
          language: 'en',
          value: name,
        },
      },
      textModulesData: [
        {
          id: 'oneLeft',
          header: 'Lock Address',
          body: minifyAddress(lockAddress),
        },
        {
          id: 'oneMiddle',
          header: 'Key ID',
          body: tokenId,
        },
        {
          id: 'oneRight',
          header: 'Network',
          body: networks[network].name,
        },
      ],
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

  const passRequest: PassRequest = {
    signature,
    signatureMessage,
    pass, // customize me?
    platform,
    templateId: '3923259c-0d1c-4f45-9a42-cf6e995a963d',
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
    const { fileURL } = await response.json()
    return fileURL
  } else {
    throw new Error('EthPass pass generation failed!')
  }
}
