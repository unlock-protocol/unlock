import { useContext, useEffect, useState } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { Card } from '@stripe/stripe-js'
import { WalletServiceContext } from '../utils/withWalletService'
import { ConfigContext } from '../utils/withConfig'

interface Config {
  services: {
    storage: {
      host: string
    }
  }
}

export const genAuthorizationHeader = (token: string) => {
  return { Authorization: ` Bearer ${token}` }
}

// Taken from locksmith's userController/cards.test.ts
export function generateTypedData(publicKey: string) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      User: [{ name: 'publicKey', type: 'address' }],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message: {
      user: {
        publicKey,
      },
    },
  }
}

export const useCards = (address?: string) => {
  const walletService: WalletService = useContext(WalletServiceContext)
  const config: Config = useContext(ConfigContext)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  const getSignature = async (typedData: any, address: string) => {
    const signature = await (walletService as any).unformattedSignTypedData(
      address,
      typedData
    )
    return signature
  }

  const getCards = async (address: string) => {
    const typedData = generateTypedData(address)
    const signature = await getSignature(typedData, address)
    const token = Buffer.from(signature).toString('base64')
    const opts = {
      method: 'GET',
      headers: genAuthorizationHeader(token),
    }

    try {
      const response = await fetch(
        `${config.services.storage.host}/users/${encodeURIComponent(
          address!
        )}/credit-cards?data=${JSON.stringify(typedData)}`,
        opts
      )
      const json = await response.json()
      setCards(json)
    } catch (e) {
      setError(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (address) {
      getCards(address)
    }
  }, [address])

  return { cards, error, loading }
}
