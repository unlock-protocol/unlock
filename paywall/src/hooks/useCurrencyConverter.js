import axios from 'axios'
import React, { useState, useEffect } from 'react'

// TODO: add polling if needed.
export default function useCurrencyConverter() {
  const [data, setData] = useState({})
  const isCancelled = React.useRef(false)

  async function fetchConversionRate() {
    const response = await axios.get(
      'https://api.coinbase.com/v2/prices/ETH-USD/buy'
    )

    const currency = response.data.data.currency
    const rate = +response.data.data.amount
    if (!isCancelled.current) {
      setData({
        [currency]: rate,
      })
    }
  }

  useEffect(() => {
    fetchConversionRate()
    // returning a callback which is invoked once the component is unmounted
    return () => {
      isCancelled.current = true
    }
  }, [])

  return data
}
