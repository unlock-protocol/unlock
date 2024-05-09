import { Token } from '@unlock-protocol/types'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useState } from 'react'
import { SelectCurrencyModal } from '../modals/SelectCurrencyModal'

export const SelectToken = ({
  network,
  onChange,
  defaultToken,
}: {
  network: number
  defaultToken?: Partial<Token>
  onChange: (token: Token) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState(defaultToken)

  const onSelect = (token: Token) => {
    onChange(token)
    setToken(token)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <SelectCurrencyModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        network={network}
        onSelect={onSelect}
        defaultCurrencyAddress={token?.address}
      />

      <div
        onClick={() => setIsOpen(true)}
        className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
      >
        <CryptoIcon symbol={token?.symbol || ''} />
        <span>{token?.symbol}</span>
      </div>
      <div className="pl-1"></div>
    </div>
  )
}
