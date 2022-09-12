import dynamic from 'next/dynamic'
import React from 'react'

interface KeyPriceProps {
  price?: number
  symbol?: string
}

const CryptoIconComponent = dynamic(() => import('react-crypto-icons'), {
  ssr: false,
})

export const CryptoIcon = ({ symbol }: { symbol: string }) => (
  <CryptoIconComponent name={symbol?.toLowerCase()} size={18} />
)

export const KeyPrice = ({ price, symbol = '' }: KeyPriceProps) => {
  if (!price) return null
  const keyPrice = price ? parseFloat(`${price}`)?.toFixed(2) : null

  const isFree = price == 0

  return (
    <div className="flex items-center gap-2">
      <CryptoIcon symbol={symbol} />
      <span className="text-xl font-bold">{isFree ? 'FREE' : keyPrice}</span>
      <span></span>
    </div>
  )
}
