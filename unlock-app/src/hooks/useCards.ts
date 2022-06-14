import { useContext, useState } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import { Card } from '@stripe/stripe-js'
import {
  useWalletService,
  WalletServiceContext,
} from '../utils/withWalletService'
import { ConfigContext, useConfig } from '../utils/withConfig'
import { ToastHelper } from '../components/helpers/toast.helper'

// TODO: cleanup. We don't need a hook but the API calls should be kept

interface Config {
  services: {
    storage: {
      host: string
    }
  }
}

export const genAuthorizationHeader = (token: string) => {
  console.log('DEPRECATED!')
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
  let signature
  if (typedData.message['Charge Card']) {
    const message = `I want to purchase a membership to ${typedData.message['Charge Card'].lock} for ${typedData.message['Charge Card'].publicKey} with my card.`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Get Card']) {
    const message = `I want to retrieve the card token for ${typedData.message['Get Card'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Save Card']) {
    const message = `I save my payment card for my account ${typedData.message['Save Card'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Delete Card']) {
    const message = `I am deleting the card linked to my account ${typedData.message['Delete Card'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else if (typedData.message['Claim Membership']) {
    const message = `I claim a membership for ${typedData.message['Claim Membership'].lock} to ${typedData.message['Claim Membership'].publicKey}`
    signature = await walletService.signMessage(message, 'personal_sign')
  } else {
    signature = await walletService.unformattedSignTypedData(address, typedData)
  }

  return signature
}

/**
 * @param walletService
 * @param address
 */
export const chargeAndSaveCard = async (
  config: any,
  walletService: any,
  address: string,
  stripeTokenId: string,
  network: number,
  lock: string,
  pricing: any,
  recipients: string[]
) => {
  const typedData = generateTypedData({
    'Charge Card': {
      publicKey: address,
      userAddress: address,
      stripeTokenId,
      recipients,
      pricing,
      lock,
      network,
    },
  })

  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'POST',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(typedData),
  }
  const response = await fetch(`${config.services.storage.host}/purchase`, opts)
  return response.json()
}

/**
 * @param walletService
 * @param address
 */
export const prepareCharge = async (
  config: any,
  walletService: any,
  address: string,
  stripeTokenId: string,
  network: number,
  lock: string,
  pricing: any,
  recipients: string[]
) => {
  const typedData = generateTypedData({
    'Charge Card': {
      publicKey: address,
      userAddress: address,
      stripeTokenId,
      recipients,
      pricing,
      lock,
      network,
    },
  })

  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'POST',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(typedData),
  }
  const response = await fetch(
    `${config.services.storage.host}/purchase/prepare`,
    opts
  )
  return response.json()
}

export const captureCharge = async (
  config: any,
  lock: string,
  network: number,
  address: string,
  recipients: string[],
  paymentIntent: string
) => {
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lock,
      network,
      userAddress: address,
      recipients,
      paymentIntent,
    }),
  }
  const response = await fetch(
    `${config.services.storage.host}/purchase/capture`,
    opts
  )
  return response.json()
}

export const claimMembership = async (
  config: any,
  walletService: any,
  address: string,
  network: number,
  lock: string
) => {
  const typedData = generateTypedData({
    'Claim Membership': {
      publicKey: address,
      lock,
      network,
    },
  })

  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'POST',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(typedData),
  }
  const response = await fetch(`${config.services.storage.host}/claim`, opts)
  return response.json()
}

export const saveCardsForAddress = async (
  config: any,
  walletService: any,
  address: string,
  stripeTokenId: string
) => {
  const typedData = generateTypedData({
    'Save Card': {
      publicKey: address,
      stripeTokenId,
    },
  })
  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'PUT',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
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

export const getCardsForAddress = async (
  config: any,
  walletService: any,
  address: string
) => {
  const typedData = generateTypedData({
    'Get Card': {
      publicKey: address,
    },
  })

  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'GET',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
    },
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
    'Delete Card': {
      publicKey: address,
    },
  })
  const signature = await getSignature(walletService, typedData, address)

  const opts = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer-Simple ${Buffer.from(signature).toString(
        'base64'
      )}`,
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

/**
 * Retrieves the pricing for a lock to be purchasable via credit card
 */
export const getFiatPricing = async (
  config: any,
  lock: string,
  network: number,
  quantity = 1
) => {
  const opts = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await fetch(
    `${config.services.storage.host}/price/fiat/${lock}?chain=${network}&quantity=${quantity}`,
    opts
  )
  return response.json()
}

export const getCardConnected = async (
  config: any,
  lock: string,
  network: number
) => {
  const opts = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(
    `${config.services.storage.host}/lock/${lock}/stripe-connected?chain=${network}`,
    opts
  )
  return response.json()
}

export const useCards = () => {
  const walletService = useWalletService()
  const config: Config = useConfig()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  /**
   * retrieves cards for an address
   * @param address
   */
  const getCards = async (address: string) => {
    setLoading(true)
    try {
      const cards = await getCardsForAddress(config, walletService, address)
      setCards(cards)
    } catch (e: any) {
      ToastHelper.error(e)
    }
    setLoading(false)
  }

  /**
   * saves cards (stripe token) for an address
   * @param address
   * @param stripeTokenId
   */
  const saveCard = async (address: string, stripeTokenId: string) => {
    setLoading(true)
    try {
      await saveCardsForAddress(config, walletService, address, stripeTokenId)
      // Refresh cards: TODO make locksmith return the cards
      await getCards(address)
    } catch (e: any) {
      console.error(e)
      ToastHelper.error(e)
    }
    setLoading(false)
  }

  /**
   * Deletes a card for a user!
   */
  const deleteCard = async (address: string) => {
    setLoading(true)
    try {
      const deleted = await deleteCardForAddress(config, walletService, address)
      if (deleted) {
        setCards([])
      }
    } catch (e: any) {
      ToastHelper.error(e)
    }
    setLoading(false)
  }
  return { cards, loading, saveCard, deleteCard, getCards }
}
