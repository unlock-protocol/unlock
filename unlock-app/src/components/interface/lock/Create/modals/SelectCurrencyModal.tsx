import { Dialog, Transition } from '@headlessui/react'
import { Token } from '@unlock-protocol/types'
import { Button, Input } from '@unlock-protocol/ui'
import { Fragment, useEffect, useState } from 'react'
import useDebounce from '~/hooks/useDebouce'
import { utils } from 'ethers'
import { useConfig } from '~/utils/withConfig'
import { CryptoIcon } from '../elements/KeyPrice'
import { addressMinify } from '~/utils/strings'

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
  const [contractAddress, setContractAddress] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const queryValue = useDebounce<string>(query)
  const tokens = networks[network!]?.tokens ?? []

  const onSelectToken = (token: Token) => {
    if (typeof onSelect === 'function') {
      onSelect(token)
      setIsOpen(false)
    }
  }

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value || ''
    setQuery(value)
  }

  useEffect(() => {
    if (!queryValue?.length) return
    try {
      const address = utils.getAddress(queryValue)
      setContractAddress(address)
    } catch (err: any) {
      setContractAddress('')
      console.error('Error: ', err)
    }
  }, [queryValue])

  const tokensFiltred = tokens?.filter(
    (token: Token) =>
      token.name?.toLowerCase().includes(queryValue?.toLowerCase()) ||
      token.symbol?.toLowerCase().includes(queryValue?.toLowerCase())
  )

  const noItems =
    tokensFiltred?.length === 0 &&
    queryValue?.length > 0 &&
    !contractAddress?.length

  const onAddContractAddress = () => {}

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
                    onChange={onSearch}
                  />

                  {contractAddress?.length > 0 && (
                    <div className="flex items-center justify-between mt-3">
                      <span>{addressMinify(contractAddress)}</span>
                      <Button size="small" onClick={onAddContractAddress}>
                        Save
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 mt-6 overflow-scroll max-h-48">
                    {noItems && (
                      <span className="text-base">
                        No token matches your filter.
                      </span>
                    )}
                    {tokensFiltred?.map((token: Token) => {
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
