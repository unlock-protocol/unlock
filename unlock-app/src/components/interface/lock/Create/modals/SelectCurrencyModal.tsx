import { Dialog, Transition } from '@headlessui/react'
import { Token } from '@unlock-protocol/types'
import { Input } from '@unlock-protocol/ui'
import { Fragment } from 'react'
import { useConfig } from '~/utils/withConfig'
import { CryptoIcon } from '../elements/KeyPrice'

interface SelectCurrencyModalProps {
  isOpen: boolean
  setIsOpen: (status: boolean) => void
  network: number
  onSelect: (token: Token) => void
}

export const SelectCurrencyModal = ({
  isOpen,
  setIsOpen,
  network,
  onSelect,
}: SelectCurrencyModalProps) => {
  const { networks } = useConfig()
  const tokens = networks[network!]?.tokens ?? []

  const onSelectToken = (token: Token) => {
    if (typeof onSelect === 'function') {
      onSelect(token)
      setIsOpen(false)
    }
  }

  return (
    <Transition show={isOpen} appear as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          setIsOpen(false)
        }}
        open
      >
        <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
        <Transition.Child
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="fixed inset-0 p-6 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full">
              <Dialog.Panel className="w-full max-w-md">
                <div className="px-6 text-left rounded-lg bg-ui-secondary-200 py-7">
                  <Input
                    label="Select a token as currency"
                    placeholder="Search or paste contract address"
                    className="bg-transparent"
                  />
                  <div className="grid grid-cols-1 gap-6 mt-6 overflow-scroll max-h-48">
                    {tokens?.map((token: Token) => {
                      return (
                        <div key={token.symbol}>
                          <span
                            onClick={() => onSelectToken(token)}
                            className="inline-flex items-center gap-3 cursor-pointer"
                          >
                            <CryptoIcon symbol={token.symbol} />
                            <span className="font-bold">{token.symbol}</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
