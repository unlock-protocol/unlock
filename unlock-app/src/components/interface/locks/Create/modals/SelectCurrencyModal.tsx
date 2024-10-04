import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Token } from '@unlock-protocol/types'
import { Button, CurrencyHint, Input } from '@unlock-protocol/ui'
import { Fragment, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import { ethers } from 'ethers'
import { useConfig } from '~/utils/withConfig'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { addressMinify } from '~/utils/strings'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useForm } from 'react-hook-form'

interface SelectCurrencyModalProps {
  isOpen: boolean
  setIsOpen: (status: boolean) => void
  network: number
  onSelect: (token: Token) => void
  defaultCurrencyAddress?: string
  noNative?: boolean
}

export const SelectCurrencyModal = ({
  isOpen,
  setIsOpen,
  network,
  onSelect,
  defaultCurrencyAddress,
  noNative,
}: SelectCurrencyModalProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()
  const [contractAddress, setContractAddress] = useState<string>('')
  const [query, setQuery] = useState('')

  const [_isReady] = useDebounce(
    () => {
      try {
        if (ethers.isAddress(query)) {
          const address = ethers.getAddress(query)
          setContractAddress(address)
        } else {
          setContractAddress(query)
        }
      } catch (err: any) {
        setContractAddress('')
        console.error('Error: ', err)
      }
    },
    500,
    [query]
  )
  const [tokens, setTokens] = useState<Token[]>([])

  const { register, resetField } = useForm({
    mode: 'onChange',
    defaultValues: {
      query: '',
    },
  })

  useEffect(() => {
    const initializeTokens = async () => {
      const { tokens: tokenItems = [] } = networks[network!] || {}
      const nativeCurrency = networks[network]?.nativeCurrency ?? {}
      const featuredTokens = [
        ...tokenItems.filter((token: Token) => !!token.featured),
      ]
      if (!noNative) {
        featuredTokens.unshift(nativeCurrency)
      }
      if (defaultCurrencyAddress) {
        const inList = featuredTokens.find(
          (token) => token.address === defaultCurrencyAddress
        )
        if (!inList) {
          const defaultCurrencySymbol = await web3Service.getTokenSymbol(
            defaultCurrencyAddress,
            network
          )
          if (defaultCurrencySymbol) {
            featuredTokens.unshift({
              name: defaultCurrencySymbol,
              symbol: defaultCurrencySymbol,
              address: defaultCurrencyAddress,
            })
          }
        }
      }
      setTokens(featuredTokens)
    }
    initializeTokens()
  }, [network, networks, defaultCurrencyAddress, noNative])

  const onSelectToken = (token: Token) => {
    if (typeof onSelect === 'function') {
      onSelect(token)
      setIsOpen(false)
    }
  }

  const { isPending: isLoadingContractToken, data: contractTokenSymbol } =
    useQuery({
      queryKey: ['getContractTokenSymbol', contractAddress, query],
      queryFn: async () => web3Service.getTokenSymbol(contractAddress, network),
    })

  const addToken = ({
    name,
    symbol,
    address,
    decimals = 18,
  }: Partial<Token>) => {
    const currentList = tokens || []
    if (currentList.find((token) => token.address === address)) return
    setTokens([
      {
        name: name!,
        symbol: symbol!,
        address: address!,
        decimals,
      },
      ...currentList,
    ])
  }

  const onImport = () => {
    addToken({
      name: contractTokenSymbol || addressMinify(contractAddress),
      symbol: contractTokenSymbol || addressMinify(contractAddress),
      address: contractAddress,
    })
    resetField('query')
    setQuery('')
    setContractAddress('')
  }

  const isValidAddress = ethers.isAddress(contractAddress)

  const noItems =
    tokens?.length === 0 &&
    query?.length > 0 &&
    !isValidAddress &&
    !isLoadingContractToken

  useEffect(() => {
    if (isOpen) return
    // clear state when modal close
    setQuery('')
    setContractAddress('')
  }, [isOpen])

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
        <TransitionChild
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
              <DialogPanel className="w-full max-w-md">
                <div className="px-6 text-left rounded-lg bg-ui-secondary-200 py-7">
                  <Input
                    label="Select a token as currency or enter its address:"
                    placeholder="Paste contract address"
                    className="bg-transparent"
                    autoComplete="off"
                    {...register('query', {
                      onChange: (e) => setQuery(e.target.value),
                    })}
                  />
                  <CurrencyHint network={networks[network as number].name} />

                  {isValidAddress && (
                    <div className="flex items-center justify-between mt-3">
                      <span>
                        {contractTokenSymbol || addressMinify(contractAddress)}
                      </span>
                      <Button
                        size="small"
                        onClick={onImport}
                        disabled={isLoadingContractToken}
                        loading={isLoadingContractToken}
                      >
                        Import
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 mt-6 overflow-scroll">
                    {noItems && (
                      <span className="text-base">
                        No token matches your filter.
                      </span>
                    )}
                    {tokens?.map((token: Token, index: number) => {
                      const key = `${token.symbol}-${index}`
                      return (
                        <div key={key}>
                          <span
                            onClick={() => onSelectToken(token)}
                            className="inline-flex items-center gap-3 cursor-pointer"
                          >
                            <CryptoIcon symbol={token?.symbol} />
                            <span className="font-bold uppercase">
                              {token?.symbol}
                            </span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
