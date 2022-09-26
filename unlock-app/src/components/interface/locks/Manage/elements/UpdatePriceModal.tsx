import { Modal, Input } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Token } from '@unlock-protocol/types'

import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { CryptoIcon } from '../../elements/KeyPrice'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useMutation, useQuery } from 'react-query'
import { SelectCurrencyModal } from '../../Create/modals/SelectCurrencyModal'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useConfig } from '~/utils/withConfig'

interface EditFormProps {
  keyPrice?: undefined
  currencyContractAddress?: string
  symbol?: string
}

interface UpdatePriceModalProps {
  lockAddress: string
  network: number
  onUpdate?: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const UpdatePriceModal = ({
  lockAddress,
  network,
  onUpdate,
  isOpen,
  setIsOpen,
}: UpdatePriceModalProps) => {
  const { networks } = useConfig()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const [changeCurrencyOpen, setChangeCurrencyModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const { baseCurrencySymbol } = networks[network!] ?? {}

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { isValid, errors },
  } = useForm<EditFormProps>({
    mode: 'onChange',
    defaultValues: {
      currencyContractAddress: undefined,
      keyPrice: undefined,
      symbol: '',
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset()
  }, [isOpen, reset])

  const getLock = async () => {
    return await web3Service.getLock(lockAddress, network)
  }

  const { data: lock } = useQuery(['getLock', lockAddress, network], async () =>
    getLock()
  )

  const updatePrice = async (): Promise<any> => {
    const { keyPrice = '' } = getValues()

    return await walletService.updateKeyPrice({
      lockAddress,
      keyPrice,
    } as any)
  }

  const updatePriceMutation = useMutation(updatePrice)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updatePriceMutation.mutateAsync(), {
        loading: 'Updating price...',
        success: 'Price updated',
        error: 'There is some unexpected issue, please try again',
      })
      setIsOpen(false)
      reset()
      if (typeof onUpdate === 'function') {
        onUpdate()
      }
    } else {
      ToastHelper.error('Form is not valid')
      setIsOpen(false)
      reset()
    }
  }

  const onSelectToken = (token: Token) => {
    setSelectedToken(token)
    setValue('currencyContractAddress', token.address)
    setValue('symbol', token.symbol)
  }

  const selectedCurrency = (
    selectedToken?.symbol ||
    lock?.currencySymbol ||
    baseCurrencySymbol
  )?.toLowerCase()

  const symbol = lockTickerSymbol(networks[network!], selectedCurrency)

  return (
    <>
      <SelectCurrencyModal
        isOpen={changeCurrencyOpen}
        setIsOpen={setChangeCurrencyModal}
        network={network!}
        onSelect={onSelectToken}
        defaultCurrency={symbol}
      />

      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <form
          className="flex flex-col gap-6 p-6 text-left"
          onSubmit={handleSubmit(onHandleSubmit)}
        >
          <span className="text-2xl font-bold">Update Price</span>

          <div>
            <label className="block px-1 mb-2 text-base" htmlFor="">
              Currency & Price:
            </label>
            <div className="grid grid-cols-2 gap-2 justify-items-stretch">
              <div className="flex flex-col gap-1.5">
                <div
                  onClick={() => {
                    // todo: enable currency when function is present
                    return null
                    setChangeCurrencyModal(true)
                  }}
                  className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                >
                  <CryptoIcon symbol={symbol} />
                  <span>{symbol}</span>
                </div>
                <div className="pl-1"></div>
              </div>

              <div className="relative">
                <Input
                  type="numeric"
                  autoComplete="off"
                  placeholder="0.00"
                  step={0.01}
                  {...register('keyPrice', {
                    required: true,
                    min: 0,
                  })}
                />
              </div>
            </div>
            {errors?.keyPrice && (
              <span className="absolute -mt-1 text-xs text-red-700">
                Please enter a positive number
              </span>
            )}
          </div>
        </form>
      </Modal>
    </>
  )
}
