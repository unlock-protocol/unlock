import React from 'react'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { PriceFormatter } from '@unlock-protocol/ui'
interface KeyPriceProps {
  price?: number
  symbol?: string
}

export const KeyPrice = ({ price, symbol = '' }: KeyPriceProps) => {
  if (price == undefined) return null

  const isFree = price == 0

  return (
    <div className="flex items-center gap-2">
      <CryptoIcon symbol={symbol} />
      <span className="text-xl font-bold">
        {isFree ? 'FREE' : <PriceFormatter price={price.toString()} />}
      </span>
    </div>
  )
}
