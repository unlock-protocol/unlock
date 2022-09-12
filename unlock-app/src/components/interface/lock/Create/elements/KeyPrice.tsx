import React from 'react'

interface KeyPriceProps {
  price?: number
  currency: string
}

export const TokenImage = ({ currency }: { currency: string }) => (
  <img src={`/images/svg/tokens/${currency.toUpperCase()}.svg`} alt="" />
)

export const KeyPrice = ({ price, currency }: KeyPriceProps) => {
  const keyPrice = price ? parseFloat(`${price}`)?.toFixed(2) : null

  return (
    <div className="flex items-center gap-2">
      <TokenImage currency={currency} />
      <span className="text-xl font-bold">{keyPrice}</span>
      <span></span>
    </div>
  )
}
