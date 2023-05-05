import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import {
  Button,
  Badge,
  Select,
  Placeholder,
  Input,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import useLock from '~/hooks/useLock'
import { useStorageService } from '~/utils/withStorageService'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { BsCheckCircle as CheckCircleIcon } from 'react-icons/bs'
import { SettingCardDetail } from '../elements/SettingCard'
import Link from 'next/link'
import { useStripeConnect, useStripeDisconnect } from '~/hooks/useStripeConnect'
import { storage } from '~/config/storage'
import { useForm } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { useGetCreditCardPricing } from '~/hooks/useCreditCard'

enum ConnectStatus {
  CONNECTED = 1,
  NOT_READY = 0,
  NO_ACCOUNT = -1,
}

interface CardPaymentProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  lock: any
}

interface ConnectStripeProps {
  connectStripeMutation: any
  lockAddress: string
  network: number
  keyGranter: string
  isManager: boolean
  disabled: boolean
}

interface DisconnectStripeProps {
  isManager: boolean
  disabled: boolean
  disconnectStipeMutation: any
}

interface CreditCardFormSchema {
  creditCardPrice?: string | number | null
}

const CreditCardPrice = ({
  lockAddress,
  network,
  disabled,
  lock,
}: CardPaymentProps) => {
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreditCardFormSchema>({
    defaultValues: {
      creditCardPrice: undefined,
    },
  })

  const { data: fiatPricing } = useGetCreditCardPricing({
    lockAddress,
    network,
  })

  const {
    mutateAsync: saveSettingMutation,
    isLoading: isSaveLockSettingLoading,
  } = useSaveLockSettings()

  const { data: { data: lockSettings = {} } = {}, isLoading } =
    useGetLockSettings({
      lockAddress,
      network,
    })

  useEffect(() => {
    const price = lockSettings?.creditCardPrice
    if (!price) return
    setValue('creditCardPrice', price)
    setUseCustomPrice(true)
  }, [lockSettings?.creditCardPrice, setValue])

  const hasPriceConversion = fiatPricing?.usd?.keyPrice

  const onSaveCreditCardPrice = async ({
    creditCardPrice,
  }: CreditCardFormSchema) => {
    const price = creditCardPrice ? parseFloat(`${creditCardPrice}`) : null

    const savePricePromise = saveSettingMutation({
      lockAddress,
      network,
      creditCardPrice: price,
    })

    await ToastHelper.promise(savePricePromise, {
      loading: 'Updating price...',
      success: 'Price updated.',
      error: 'There is some issue updating the price.',
    })
  }

  const onSubmit = (fields: CreditCardFormSchema) => {
    onSaveCreditCardPrice(fields)
  }

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Card />
      </Placeholder.Root>
    )
  }

  const saveDisabled = isSaveLockSettingLoading || disabled

  const needsCustomPrice = !hasPriceConversion && !lockSettings?.creditCardPrice
  const symbol = lock?.currencySymbol

  return (
    <div className="grid gap-1">
      <SettingCardDetail title="Price in $USD" />
      <div className="grid grid-cols-1 gap-1 p-4 bg-gray-100 rounded-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid items-center gap-3"
        >
          {hasPriceConversion && (
            <>
              <ToggleSwitch
                title="Use fixed price"
                enabled={useCustomPrice}
                setEnabled={setUseCustomPrice}
                onChange={(enabled) => {
                  if (!enabled) {
                    setValue('creditCardPrice', null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                }}
              />
              {!useCustomPrice && (
                <span className="text-sm">
                  When custom price is not set, the conversion price will be
                  used for credit card payments.
                </span>
              )}
            </>
          )}
          <>
            {(useCustomPrice || !hasPriceConversion) && (
              <Input
                type="numeric"
                step="any"
                disabled={disabled}
                description={
                  hasPriceConversion
                    ? 'Price in $USD that will be charged, the actual conversion price will ignored.'
                    : `Price in $USD that will be charged`
                }
                error={errors?.creditCardPrice?.message}
                {...register('creditCardPrice', {
                  required: true,
                  min: {
                    value: 0.5,
                    message:
                      'Price is too low for us to process credit cards. It needs to be at least $0.50.',
                  },
                })}
              />
            )}
            <div className="w-full md:w-1/3">
              <Button className="w-full" size="small" disabled={saveDisabled}>
                Apply
              </Button>
            </div>
          </>
        </form>
      </div>
      {needsCustomPrice && (
        <span className="text-sm font-semibold text-red-600">
          {`There is no conversion price for ${symbol} your lock. Your price needs to be set manually.`}
        </span>
      )}
    </div>
  )
}

const DisconnectStripe = ({
  isManager,
  disconnectStipeMutation,
  disabled,
}: DisconnectStripeProps) => {
  return (
    <div className="flex flex-col gap-4">
      <SettingCardDetail
        title="Credit card payment ready"
        description="Member of this Lock can now pay with credit card or crypto as they wish. "
      />
      <div className="flex flex-col items-center gap-4 md:gap-8 md:flex-row">
        <Badge variant="green" className="justify-center w-full md:w-1/3">
          <div className="flex items-center gap-2">
            <span>Payment method enabled</span>
            <CheckCircleIcon />
          </div>
        </Badge>
        {isManager && (
          <Button
            size="small"
            variant="borderless"
            className="text-brand-ui-primary"
            disabled={disconnectStipeMutation.isLoading || disabled}
            onClick={(event) => {
              event.preventDefault()
              disconnectStipeMutation.mutate(undefined, {
                onSuccess: () => {
                  ToastHelper.success('Stripe disconnected')
                },
                onError: () => {
                  ToastHelper.error('Stripe disconnection failed')
                },
              })
            }}
          >
            Disconnect Stripe
          </Button>
        )}
      </div>
    </div>
  )
}

const ConnectStripe = ({
  connectStripeMutation,
  lockAddress,
  network,
  keyGranter,
  isManager,
  disabled,
}: ConnectStripeProps) => {
  const [stripeAccount, setStripeAccount] = useState<string>()
  const { getWalletService, account } = useAuth()
  const web3Service = useWeb3Service()

  const {
    data: stripeConnections = [],
    isLoading: isLoadingStripeConnections,
  } = useQuery(['stripeConnections', account], async () => {
    const response = await storage.getStripeConnections()
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    return response.data.result || []
  })

  const checkIsKeyGranter = async (keyGranter: string) => {
    return await web3Service.isKeyGranter(lockAddress, keyGranter, network)
  }

  const grantKeyGrantorRoleMutation = useMutation(async (): Promise<any> => {
    const walletService = await getWalletService(network)
    return walletService.addKeyGranter({
      lockAddress,
      keyGranter,
    })
  })

  const onGrantKeyRole = async () => {
    await ToastHelper.promise(grantKeyGrantorRoleMutation.mutateAsync(), {
      error: `Can't grant role, please try again.`,
      success: 'Key granted',
      loading: 'Allow key granting',
    })
  }

  const connectStripe = async (event: any) => {
    event.preventDefault()
    connectStripeMutation.mutate(
      { stripeAccount },
      {
        onSuccess: (connect: any) => {
          if (connect?.url) {
            window.location.assign(connect.url)
          } else {
            ToastHelper.success('Stripe connection succeeded!')
          }
        },
        onError: () => {
          ToastHelper.error('Stripe connection failed')
        },
      }
    )
  }

  const { isLoading: isLoadingCheckGrantedStatus, data: isGranted } = useQuery(
    ['checkIsKeyGranter', lockAddress, network, keyGranter],
    async () => {
      return checkIsKeyGranter(keyGranter)
    }
  )

  const isLoading = isLoadingCheckGrantedStatus || isLoadingStripeConnections

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line size="xl" width="sm" />
      </Placeholder.Root>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingCardDetail
        title="Enable Contract to Accept Credit Card"
        description={
          <div className="flex flex-col gap-2">
            <span>
              {`Credit card processing is not part of the core protocol.
                Unlock Labs processes non-crypto payments via our Stripe
                integration and includes fees that are applied on top of your
                lock's key price.`}
            </span>
            <span>
              If you enable credit card payments for your lock, your members
              will usually be charged a higher amount than the amount for your
              lock. The Unlock Labs fee is 10%, which must be added to the
              Stripe fees and gas costs.
            </span>
            <span>
              For more details see{' '}
              <Link
                className="font-semibold text-brand-ui-primary"
                href="https://unlock-protocol.com/guides/enabling-credit-cards/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Enabling Credit Cards guide
              </Link>
              .
            </span>
          </div>
        }
      />
      {isManager && (
        <div className="flex flex-col gap-3">
          {isGranted ? (
            <form className="grid gap-4" onSubmit={connectStripe}>
              {(stripeConnections ?? [])?.length > 0 && (
                <Select
                  defaultValue={stripeAccount}
                  onChange={(value: any) => {
                    setStripeAccount(value.toString())
                  }}
                  options={(stripeConnections ?? [])
                    ?.map((connection: any) => {
                      return {
                        label: connection.settings.dashboard.display_name,
                        value: connection.id,
                      }
                    })
                    .concat({
                      label: 'Connect a new Stripe account',
                      value: '',
                    })}
                  label="Use a Stripe account you previously connected to another contract:"
                />
              )}
              <Button
                className="w-full md:w-1/3"
                loading={connectStripeMutation.isLoading}
                type="submit"
                disabled={disabled}
              >
                Connect Stripe
              </Button>
            </form>
          ) : (
            <Button
              size="small"
              variant="outlined-primary"
              className="w-full md:w-1/3"
              onClick={onGrantKeyRole}
              loading={grantKeyGrantorRoleMutation.isLoading}
            >
              Accept
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export const CreditCardForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  lock,
}: CardPaymentProps) => {
  const storageService = useStorageService()
  const { isStripeConnected } = useLock({ address: lockAddress }, network)

  const getKeyGranter = async () => {
    return await storageService.getKeyGranter(network)
  }

  const disconnectStipeMutation = useStripeDisconnect({
    lockAddress,
    network,
  })

  const connectStripeMutation = useStripeConnect({
    lockAddress,
    network,
  })

  const { data: fiatPricing, isLoading: isLoadingPricing } =
    useGetCreditCardPricing({
      lockAddress,
      network,
    })

  const [
    { isLoading, data: isConnected = 0 },
    { isLoading: isLoadingKeyGranter, data: keyGranter },
  ] = useQueries({
    queries: [
      {
        queryKey: [
          'isStripeConnected',
          lockAddress,
          network,
          disconnectStipeMutation.isSuccess,
          connectStripeMutation.isSuccess,
        ],
        queryFn: isStripeConnected,
      },
      {
        queryKey: ['getKeyGranter', lockAddress, network],
        queryFn: getKeyGranter,
      },
    ],
  })

  const isPricingLow = fiatPricing?.usd?.keyPrice < 50

  const loading = isLoading || isLoadingKeyGranter || isLoadingPricing

  if (loading)
    return (
      <Placeholder.Root>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line size="xl" width="sm" />
      </Placeholder.Root>
    )

  return (
    <div className="flex flex-col gap-2">
      {[ConnectStatus.NOT_READY, ConnectStatus.NO_ACCOUNT].includes(
        isConnected
      ) ? (
        <ConnectStripe
          connectStripeMutation={connectStripeMutation}
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          keyGranter={keyGranter}
          disabled={disabled}
        />
      ) : [ConnectStatus.CONNECTED].includes(isConnected) ? (
        <div className="grid grid-cols-1 gap-4">
          <DisconnectStripe
            isManager={isManager}
            disconnectStipeMutation={disconnectStipeMutation}
            disabled={disabled}
          />
          <CreditCardPrice
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            disabled={disabled}
            lock={lock}
          />
        </div>
      ) : null}

      {isPricingLow && (
        <span className="text-sm text-red-600">
          Your current price is too low for us to process credit cards. It needs
          to be at least $0.50.
        </span>
      )}
    </div>
  )
}
