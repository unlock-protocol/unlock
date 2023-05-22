import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { Button, Badge, Select, Placeholder } from '@unlock-protocol/ui'
import { useState } from 'react'
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
import { useUSDPricing } from '~/hooks/useUSDPricing'
import { useLockData } from '~/hooks/useLockData'

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

const DisconnectStripe = ({
  isManager,
  disconnectStipeMutation,
  disabled,
}: DisconnectStripeProps) => {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs">
        <SettingCardDetail
          title="Credit card payment ready"
          description="Member of this Lock can now pay with credit card or crypto as they wish. "
        />
      </span>
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

  const {
    isLoading: isLoadingCheckGrantedStatus,
    data: isGranted,
    refetch: refetchCheckKeyGranter,
  } = useQuery(
    ['checkIsKeyGranter', lockAddress, network, keyGranter],
    async () => {
      return checkIsKeyGranter(keyGranter)
    }
  )

  const grantKeyGrantorRoleMutation = useMutation(async (): Promise<any> => {
    const walletService = await getWalletService(network)
    return walletService.addKeyGranter({
      lockAddress,
      keyGranter,
    })
  })

  const onGrantKeyRole = async () => {
    const keyGrantPromise = grantKeyGrantorRoleMutation.mutateAsync()
    await ToastHelper.promise(keyGrantPromise, {
      error: `Can't grant role, please try again.`,
      success: 'Key granted',
      loading: 'Allow key granting',
    })
    await refetchCheckKeyGranter()
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
              disabled={grantKeyGrantorRoleMutation.isLoading}
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

  const { lock } = useLockData({
    network,
    lockAddress,
  })

  const { isLoading: isLoadingPricing, data: fiatPricing } = useUSDPricing({
    network,
    lockAddress,
    currencyContractAddress: undefined,
    amount: Number(lock?.keyPrice),
    enabled: !!lock?.address,
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

  const isPricingLow = (fiatPricing?.usd?.amount ?? 0) < 0.5

  const loading = isLoading || isLoadingKeyGranter || isLoadingPricing

  const Status = () => {
    if (
      [ConnectStatus.NOT_READY, ConnectStatus.NO_ACCOUNT].includes(isConnected)
    ) {
      return (
        <ConnectStripe
          connectStripeMutation={connectStripeMutation}
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          keyGranter={keyGranter}
          disabled={disabled}
        />
      )
    }

    if ([ConnectStatus.CONNECTED].includes(isConnected)) {
      return (
        <DisconnectStripe
          isManager={isManager}
          disconnectStipeMutation={disconnectStipeMutation}
          disabled={disabled}
        />
      )
    }
    return null
  }

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
      <Status />
      {isPricingLow && (
        <span className="text-sm text-red-600">
          Your current price is too low for us to process credit cards. It needs
          to be at least $0.50.
        </span>
      )}
    </div>
  )
}
