import { useContext, useState } from 'react'
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
export function generateTypedData(message: any) {
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
    message,
  }
}

/**
 * yields a signature for typedDaata
 * @param walletService
 * @param typedData
 * @param address
 */
export const getSignature = async (
  walletService: any,
  typedData: any,
  address: string
) => {
  const signature = await walletService.unformattedSignTypedData(
    address,
    typedData
  )
  return signature
}

/**
 * returns the cards for a given address
 * @param walletService
 * @param address
 */
export const saveCardsForAddress = async (
  config: any,
  walletService: any,
  address: string,
  stripeTokenId: string
) => {
  const typedData = generateTypedData({
    user: {
      publicKey: address,
      stripeTokenId,
    },
  })
  const signature = await getSignature(walletService, typedData, address)
  const token = Buffer.from(signature).toString('base64')

  const opts = {
    method: 'PUT',
    headers: {
      ...genAuthorizationHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(typedData),
  }

  return fetch(
    `${config.services.storage.host}/users/${encodeURIComponent(
      address!
    )}/credit-cards`,
    opts
  )
}

/**
 * returns the cards for a given address
 * @param walletService
 * @param address
 */
export const getCardsForAddress = async (
  config: any,
  walletService: any,
  address: string
) => {
  const typedData = generateTypedData({
    user: {
      publicKey: address,
    },
  })
  const signature = await getSignature(walletService, typedData, address)
  const token = Buffer.from(signature).toString('base64')
  const opts = {
    method: 'GET',
    headers: genAuthorizationHeader(token),
  }

  const response = await fetch(
    `${config.services.storage.host}/users/${encodeURIComponent(
      address!
    )}/credit-cards?data=${JSON.stringify(typedData)}`,
    opts
  )
  return response.json()
}

/**
 * Deletes card for a given address
 * @param walletService
 * @param address
 */
export const deleteCardForAddress = async (
  config: any,
  walletService: any,
  address: string
) => {
  const typedData = generateTypedData({
    user: {
      publicKey: address,
    },
  })
  const signature = await getSignature(walletService, typedData, address)
  const token = Buffer.from(signature).toString('base64')

  const opts = {
    method: 'DELETE',
    headers: {
      ...genAuthorizationHeader(token),
      'Content-Type': 'application/json',
    },
  }

  const response = fetch(
    `${config.services.storage.host}/users/${encodeURIComponent(
      address!
    )}/credit-cards?data=${JSON.stringify(typedData)}`,
    opts
  )
  return (await response).status === 202
}
export const useCards = (address: string) => {
  const walletService: WalletService = useContext(WalletServiceContext)
  const config: Config = useContext(ConfigContext)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  /**
   * retrieves cards for an address
   * @param address
   */
  const getCards = async () => {
    setLoading(true)
    try {
      const cards = await getCardsForAddress(config, walletService, address)
      setCards(cards)
    } catch (e) {
      setError(e)
    }
    setLoading(false)
  }

  /**
   * saves cards (stripe token) for an address
   * @param address
   */
  const saveCard = async (stripeTokenId: string) => {
    setLoading(true)
    try {
      await saveCardsForAddress(config, walletService, address, stripeTokenId)
      // Refresh cards: TODO make locksmith return the cards
      await getCards()
    } catch (e) {
      setError(e)
    }
    setLoading(false)
  }

  /**
   * Deletes a card for a user!
   */
  const deleteCard = async () => {
    setLoading(true)
    try {
      const deleted = await deleteCardForAddress(config, walletService, address)
      if (deleted) {
        setCards([])
      }
    } catch (e) {
      setError(e)
    }
    setLoading(false)
  }
  return { cards, error, loading, saveCard, deleteCard, getCards }
}
