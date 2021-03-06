import { useState, useContext, useEffect } from 'react'
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
export const useFiatKeyPrices = (address: string, activePayment: string) => {
  const [loading, setLoading] = useState(true)
  const [fiatPrices, updatePrices] = useState({} as KeyPrice)

  const config: Config = useContext(ConfigContext)

  async function getFiatKeyPriceFor(lockAddress: string) {
    const response = await fetch(
      `${config.services.storage.host}/price/fiat/${lockAddress}`
    )
    const prices: KeyPrice = await response.json()

    updatePrices(prices as KeyPrice)
    setLoading(false)
  }

  useEffect(() => {
    if (activePayment === 'Credit Card') {
      setLoading(true)
      getFiatKeyPriceFor(address)
    }
  }, [address, activePayment])

  return { loading, fiatPrices }
}
