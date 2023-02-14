import axios from 'axios'
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
  signatureMessage,
  network,
  platform,
  image,
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
  const keyResponse = await storage.ticketQRCode(network, lockAddress, tokenId)
  console.log(keyResponse)

  const payload = {
    signature,
    signatureMessage,
    pass, // customize me?
    platform,
    chain: {
      network: network,
      name: 'evm',
    },
    nft: {
      contractAddress,
      tokenId,
    },
    barcode: {
      redirect: {
        url: '', // URL used on QR Code,
      },
    },
    image: 'https://app.unlock-protocol.com/images/unlock.png', // Placeholder until EthPass supports SVGs
  }

  try {
    const response = await axios.post(
      'https://api.ethpass.xyz/api/v0/passes',
      payload,
      {
        headers: {
          'X-API-KEY': 'sk_live_kCHr20HfJ73Xe3Nfmzr83Yqe4qoxxDwX',
        },
      }
    )
    console.log(response)

    if (response.status === 200) {
      const { id, fileURL, buffer } = response.data
      console.log(buffer)
    } else {
      console.log('## Bad request', response)
    }
  } catch (err) {
    console.log('## Error', err)
  }
}
