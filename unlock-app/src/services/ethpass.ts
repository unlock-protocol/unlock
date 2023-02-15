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
  if (false && !verificationResponse.data.verificationUrl) {
    throw new Error('Failed to retrieve verification URL')
  }
  const verificationUrl =
    'https://staging-app.unlock-protocol.com/verification?data=%7B%22network%22%3A5%2C%22account%22%3A%220x61be315032235Ac365e39705c11c47fdaee698Ee%22%2C%22lockAddress%22%3A%220xD87a6C61C322019CAdbf70E616f5940B027eC895%22%2C%22tokenId%22%3A%221%22%2C%22timestamp%22%3A1676479583463%7D&sig=0x38e67ee865d9e4c71099d702d0521c42b771163b3759494b01b8d3795c2aaf1a050d9d39ced758ebf9c085c8f47c2f2df8bfc115cae352d60b05324448a7506c1c'

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
      contractAddress: lockAddress,
      tokenId,
    },
    barcode: {
      redirect: {
        url: verificationUrl,
      },
    },
    image: 'https://app.unlock-protocol.com/images/unlock.png', // Placeholder until EthPass supports SVGs
  }

  const response = await axios.post(
    'https://api.ethpass.xyz/api/v0/passes',
    payload,
    {
      headers: {
        'X-API-KEY': 'sk_live_kCHr20HfJ73Xe3Nfmzr83Yqe4qoxxDwX',
      },
    }
  )

  if (response.status === 200) {
    return response.data?.fileURL
  } else {
    throw new Error('EthPass pass generation failed!')
  }
}
