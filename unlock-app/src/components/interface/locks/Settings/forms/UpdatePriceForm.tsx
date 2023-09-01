import { useQuery, useMutation } from '@tanstack/react-query'
import { Token } from '@unlock-protocol/types'
import { ToggleSwitch, Input, Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SelectCurrencyModal } from '../../Create/modals/SelectCurrencyModal'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useAuth } from '~/contexts/AuthenticationContext'

interface EditFormProps {
  keyPrice?: string
  currencyContractAddress?: string
  symbol?: string
  isFree: boolean
}

interface UpdatePriceFormProps {
  lockAddress: string
  network: number
  price: number
  isManager: boolean
  disabled: boolean
}

export const UpdatePriceForm = ({
  lockAddress,
  network,
  price,
  isManager,
  disabled,
}: UpdatePriceFormProps) => {
  const keyPrice: number | undefined =
    price == undefined ? 0 : parseFloat(`${price}`)
  const isFreeKey = keyPrice == 0

  const [isFree, setIsFree] = useState(isFreeKey)
  const { networks } = useConfig()
  const { getWalletService } = useAuth()
  const web3Service = useWeb3Service()
  const [changeCurrencyOpen, setChangeCurrencyModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const baseCurrencySymbol = networks?.[network].nativeCurrency.symbol

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isValid, errors },
  } = useForm<EditFormProps>({
    mode: 'onChange',
    defaultValues: {
      currencyContractAddress: undefined,
      keyPrice: keyPrice?.toFixed(3),
      symbol: '',
      isFree,
    },
  })

  const getLock = async () => {
    return await web3Service.getLock(lockAddress, network)
  }

  const { data: lock } = useQuery(['getLock', lockAddress, network], async () =>
    getLock()
  )

  const updatePrice = async ({
    keyPrice = '',
    currencyContractAddress,
  }: EditFormProps): Promise<any> => {
    const erc20Address =
      currencyContractAddress || lock?.currencyContractAddress || 0

    const price = isFree ? 0 : keyPrice
    const walletService = await getWalletService(network)
    return await walletService.updateKeyPrice({
      lockAddress,
      keyPrice: `${price}`,
      erc20Address,
    } as any)
  }

  const updatePriceMutation = useMutation(updatePrice)

  const onHandleSubmit = async (fields: EditFormProps) => {
    if (isValid) {
      await ToastHelper.promise(updatePriceMutation.mutateAsync(fields), {
        loading: 'Updating price...',
        success: 'Price updated',
        error: 'We could not update the price for this lock.',
      })
    } else {
      ToastHelper.error('Form is not valid')
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

  const disabledInput = disabled || updatePriceMutation.isLoading

  return (
    <>
      <SelectCurrencyModal
        isOpen={changeCurrencyOpen}
        setIsOpen={setChangeCurrencyModal}
        network={network}
        onSelect={onSelectToken}
      />

      <form
        className="flex flex-col gap-6 text-left"
        onSubmit={handleSubmit(onHandleSubmit)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="block px-1 text-base" htmlFor="">
              Currency & Price:
            </label>
            <ToggleSwitch
              title="Free"
              enabled={isFree}
              setEnabled={setIsFree}
              disabled={disabledInput}
              onChange={(enabled: boolean) => {
                setValue('isFree', enabled)
                setValue('keyPrice', enabled ? '0' : keyPrice.toString(), {
                  shouldValidate: true,
                })
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 justify-items-stretch">
            <div className="flex flex-col gap-1.5">
              <div
                onClick={() => {
                  if (disabled) return
                  setChangeCurrencyModal(true)
                }}
                className={`${
                  disabled ? 'bg-gray-100' : 'bg-white'
                } box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none`}
              >
                <CryptoIcon symbol={symbol} />
                <span>{symbol}</span>
              </div>
              <div className="pl-1"></div>
            </div>

            <div className="relative">
              <Input
                type="number"
                autoComplete="off"
                placeholder="0.00"
                step="any"
                disabled={isFree || disabledInput}
                {...register('keyPrice', {
                  valueAsNumber: true,
                  required: !isFree,
                  min: 0,
                })}
                error={errors?.keyPrice && 'Please enter a positive number'}
              />
            </div>
          </div>
        </div>

        <span className="text-sm text-gray-600">
          When changing the price, please remember that users who have approved
          recurring memberships will need to manually renew in order to approve
          the price change. Similarly if users cancel their membership, they
          will receive a refund in the new currency, and an amount calculated
          based on the new pricing, not the old one.
        </span>

        {isManager && (
          <Button
            className="w-full md:w-1/3"
            type="submit"
            loading={updatePriceMutation.isLoading}
            disabled={disabledInput}
          >
            Update
          </Button>
        )}
      </form>
    </>
  )
}
