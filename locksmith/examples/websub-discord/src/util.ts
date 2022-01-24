import crypto from 'crypto'
import { ColorResolvable } from 'discord.js'

export function chunk<T>(array: T[], size = 5) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

interface CreateSignatureOptions {
  content: string
  secret: string
  algorithm: string
}
export function createSignature({
  secret,
  content,
  algorithm,
}: CreateSignatureOptions) {
  const signature = crypto
    .createHmac(algorithm, secret)
    .update(content)
    .digest('hex')
  return signature
}

export const NETWORK_COLOR: Record<string, ColorResolvable> = {
  '1': '#3c3c3d',
  '10': '#ff001b',
  '100': '#39a7a1',
  '137': '#8146d9',
  '56': '#f8ba33',
}

interface Network {
  id: number
  name: string
  explorer: {
    name: string
    urls: {
      address(address: string): string
    }
  }
}

export const networks: Record<string, Network> = {
  '1': {
    id: 1,
    name: 'Ethereum',
    explorer: {
      name: 'Etherscan',
      urls: {
        address: (address) => `https://etherscan.io/address/${address}`,
      },
    },
  },
  '10': {
    id: 10,
    name: 'Optimism',
    explorer: {
      name: 'Etherscan',
      urls: {
        address: (address) =>
          `https://optimistic.etherscan.io/address/${address}`,
      },
    },
  },
  '100': {
    id: 100,
    name: 'xDai',
    explorer: {
      name: 'Blockscout',
      urls: {
        address: (address) =>
          `https://blockscout.com/poa/xdai/address/${address}/transactions`,
      },
    },
  },
  '56': {
    id: 56,
    name: 'Binance Smart Chain',
    explorer: {
      name: 'BscScan',
      urls: {
        address: (address) => `https://bscscan.com/address/${address}`,
      },
    },
  },
  '137': {
    id: 137,
    name: 'Polygon',
    explorer: {
      name: 'Polygonscan',
      urls: {
        address: (address) => `https://polygonscan.com/address/${address}`,
      },
    },
  },
  '4': {
    id: 4,
    name: 'Rinkeby',
    explorer: {
      name: 'Etherscan',
      urls: {
        address: (address) => `https://rinkeby.etherscan.io/address/${address}`,
      },
    },
  },
  '69': {
    id: 69,
    name: 'Optimistic Kovan',
    explorer: {
      name: 'Etherscan',
      urls: {
        address: (address) =>
          `https://kovan-optimistic.etherscan.io/address/${address}`,
      },
    },
  },
}
