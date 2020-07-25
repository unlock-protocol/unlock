import { useReducer, useContext, useEffect } from 'react'
import { ConfigContext } from '../utils/withConfig'

interface Config {
  services: {
    storage: {
      host: string
    }
  }
}

interface KeyPrice {
  [currency: string]: string
}

export interface KeyPrices {
  [lockAddress: string]: KeyPrice
}

interface KeyPriceUpdate {
  lockAddress: string
  prices: KeyPrice
}

export const keyPricesReducer = (prices: KeyPrices, update: KeyPriceUpdate) => {
  if (Object.keys(update.prices).length === 0) {
    // Locks that are not approved for credit card purchases will have
    // an empty `prices` object. It's easier on the consumer side if
    // those unapproved locks are simply not included in the return
    // value.
    return prices
  }

  return {
    ...prices,
    [update.lockAddress]: update.prices,
  }
}

const defaultKeyPrices: KeyPrices = {}

export const useFiatKeyPrices = (lockAddresses: string[]) => {
  const [fiatKeyPrices, updatePrice] = useReducer(
    keyPricesReducer,
    defaultKeyPrices
  )
  const config: Config = useContext(ConfigContext)

  async function getFiatKeyPriceFor(lockAddress: string) {
    const response = await fetch(
      `${config.services.storage.host}/price/fiat/${lockAddress}`
    )
    const prices: KeyPrice = await response.json()

    updatePrice({
      lockAddress,
      prices,
    })
  }

  useEffect(() => {
    lockAddresses.forEach((address) => getFiatKeyPriceFor(address))
  }, [JSON.stringify(lockAddresses)])

  return fiatKeyPrices
}
