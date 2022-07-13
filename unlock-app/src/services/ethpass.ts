import axios from 'axios'
import { networks } from '@unlock-protocol/networks'

export enum Platform {
  APPLE = 'apple',
  GOOGLE = 'google',
}

export const createWalletPass = async (props: any) => {
  const {
    signature,
    contractAddress,
    tokenId,
    signatureMessage,
    chainId,
    platform,
    image,
  } = props

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
          value: `${contractAddress.slice(0, 6)}...${contractAddress.slice(
            contractAddress.length - 4
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
          value: networks[chainId].name,
          textAlignment: 'PKTextAlignmentNatural',
        },
      ],
    }
  } else {
    pass = {
      messages: [],
    }
  }

  const payload = {
    signature,
    contractAddress,
    tokenId,
    signatureMessage,
    pass,
    chainId,
    platform,
    barcode: {
      message:
        'Thanks for testing beta! This is currently only used as a placeholder.',
    },
    // image,
  }

  try {
    const response = await axios.post(
      'https://api.ethpass.xyz/api/v0/passes',
      payload,
      {
        headers: {
          'X-API-KEY': process.env.ETHPASS_API_KEY || '',
        },
      }
    )

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
