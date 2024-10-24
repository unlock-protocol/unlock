import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Badge, Select, Placeholder } from '@unlock-protocol/ui'
import { useState, useCallback, useMemo } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { BsCheckCircle as CheckCircleIcon } from 'react-icons/bs'
import { SettingCardDetail } from '../elements/SettingCard'
import Link from 'next/link'
import {
  useGetLockStripeConnectionDetails,
  useStripeConnect,
  useStripeDisconnect,
} from '~/hooks/useStripeConnect'
import { locksmith } from '~/config/locksmith'
import { useUSDPricing } from '~/hooks/useUSDPricing'
import { useLockData } from '~/hooks/useLockData'
import CreditCardCustomPrice from './CreditCardCustomPrice'
import useKeyGranter from '~/hooks/useKeyGranter'
import { useProvider } from '~/hooks/useProvider'
import { useAuthenticate } from '~/hooks/useAuthenticate'

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

interface ConnectStripe {
  onConnectStripe: (stripeAccount?: string) => void
  onDisconnect: any
}

interface ConnectStripeProps {
  lockAddress: string
  network: number
  keyGranter: string
  isManager: boolean
  disabled: boolean
}

interface DisconnectStripeProps {
  isManager: boolean
  disabled: boolean
  onDisconnect: any
}

const DisconnectStripe = ({
  isManager,
  onDisconnect,
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
            <span className="whitespace-nowrap">Card payments enabled</span>
            <CheckCircleIcon />
          </div>
        </Badge>
        {isManager && (
          <Button
            size="small"
            variant="borderless"
            className="text-brand-ui-primary"
            disabled={disabled}
            onClick={onDisconnect}
          >
            Disconnect Stripe
          </Button>
        )}
      </div>
    </div>
  )
}

const ConnectStripe = ({
  lockAddress,
  network,
  keyGranter,
  disabled,
  onConnectStripe,
}: ConnectStripeProps & Pick<ConnectStripe, 'onConnectStripe'>) => {
  const [stripeAccount, setStripeAccount] = useState<string>()
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const web3Service = useWeb3Service()

  const {
    data: stripeConnections = [],
    isPending: isLoadingStripeConnections,
  } = useQuery({
    queryKey: ['stripeConnections', account],
    queryFn: async () => {
      const response = await locksmith.getStripeConnections()
      if (response.data.error) {
        throw new Error(response.data.error)
      }
      return response.data.result || []
    },
  })

  const checkIsKeyGranter = useCallback(
    async (keyGranter: string) => {
      return await web3Service.isKeyGranter(lockAddress, keyGranter, network)
    },
    [web3Service, lockAddress, network]
  )

  const {
    isPending: isLoadingCheckGrantedStatus,
    data: isGranted,
    refetch: refetchCheckKeyGranter,
  } = useQuery({
    queryKey: ['checkIsKeyGranter', lockAddress, network, keyGranter],
    queryFn: () => checkIsKeyGranter(keyGranter),
  })

  const grantKeyGrantorRoleMutation = useMutation({
    mutationFn: async (): Promise<any> => {
      const walletService = await getWalletService(network)
      return walletService.addKeyGranter({
        lockAddress,
        keyGranter,
      })
    },
  })

  const onGrantKeyRole = async () => {
    const keyGrantPromise = grantKeyGrantorRoleMutation.mutateAsync()
    await ToastHelper.promise(keyGrantPromise, {
      error: "Can't grant role, please try again.",
      success: 'Key granted',
      loading: 'Allow key granting',
    })
    await refetchCheckKeyGranter()
  }

  const isLoading = isLoadingCheckGrantedStatus || isLoadingStripeConnections

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line size="xl" />
      </Placeholder.Root>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingCardDetail
        title="Enable offchain payments"
        description={
          <div className="flex flex-col gap-2">
            <span>
              {`Credit card processing is not part of the core protocol.
                Unlock Labs processes non-crypto payments via our Stripe
                integration and includes fees that are applied on top of your
                lock's key price.`}
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

      <div className="flex flex-col gap-3">
        {isGranted ? (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              onConnectStripe(stripeAccount)
            }}
          >
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
            disabled={grantKeyGrantorRoleMutation.isPending}
          >
            Accept
          </Button>
        )}
      </div>
    </div>
  )
}

const StripeNotReady = ({
  isManager,
  disabled,
  onDisconnect,
  onConnectStripe,
  connectedStripeAccount,
}: Pick<ConnectStripeProps, 'isManager' | 'disabled'> &
  ConnectStripe & {
    connectedStripeAccount?: any
  }) => {
  return (
    <span className="grid gap-2 text-sm">
      <span className="font-semibold text-red-500">
        Your Stripe account is connected but not ready to process charges yet.
        Make sure that all the details you entered on Stripe are valid and your
        email has been verified from Stripe.
      </span>
      <div className="flex items-center gap-0.5">
        <div className="w-full md:w-1/3">
          <Button
            onClick={(e: any) => {
              e?.preventDefault()
              onConnectStripe(connectedStripeAccount)
            }}
            size="small"
          >
            Resume Stripe Setup
          </Button>
        </div>
        {isManager && (
          <div className="w-full md:w-1/3">
            <Button
              size="small"
              variant="borderless"
              className="text-brand-ui-primary"
              disabled={disabled}
              onClick={onDisconnect}
            >
              Disconnect Stripe
            </Button>
          </div>
        )}
      </div>
    </span>
  )
}

export const CreditCardWithStripeForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: CardPaymentProps) => {
  const {
    isPending,
    data: stripeConnectionDetails,
    refetch: refetchStripeConnectionDetails,
  } = useGetLockStripeConnectionDetails({
    lockAddress,
    network,
  })

  const stripeConnectionState = stripeConnectionDetails?.connected ?? 0
  const connectedStripeAccount = stripeConnectionDetails?.account

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

  const { isPending: isLoadingPricing, data: fiatPricing } = useUSDPricing({
    network,
    lockAddress,
    currencyContractAddress: undefined,
    amount: Number(lock?.keyPrice),
    enabled: !!lock?.address,
  })

  const isPricingLow = useMemo(
    () => (fiatPricing?.usd?.amount ?? 0) < 0.5,
    [fiatPricing]
  )

  const { data: keyGranter, isPending: isLoadingKeyGranter } = useKeyGranter({
    network,
  })

  const loading = isPending || isLoadingKeyGranter || isLoadingPricing

  const onDisconnectStripe = useCallback(
    async (event: any) => {
      event.preventDefault()
      const disconnectStripePromise = disconnectStipeMutation.mutateAsync()
      await ToastHelper.promise(disconnectStripePromise, {
        error: 'Stripe disconnection failed.',
        success: 'Stripe disconnected.',
        loading: 'Disconnecting Stripe.',
      })
      await refetchStripeConnectionDetails()
    },
    [disconnectStipeMutation, refetchStripeConnectionDetails]
  )

  const onConnectStripe = useCallback(
    (stripeAccount?: string) => {
      connectStripeMutation.mutate(
        { stripeAccount },
        {
          onSuccess: (connect: any) => {
            if (connect?.url) {
              window.location.assign(connect.url)
            } else {
              ToastHelper.success('Stripe connection succeeded!')
              refetchStripeConnectionDetails()
            }
          },
          onError: () => {
            ToastHelper.error('Stripe connection failed')
          },
        }
      )
    },
    [connectStripeMutation, refetchStripeConnectionDetails]
  )

  const StatusComponent = useMemo(() => {
    const supportedCurrencies =
      stripeConnectionDetails?.countrySpec?.supported_payment_currencies ?? []

    if (ConnectStatus.NO_ACCOUNT === stripeConnectionState) {
      return (
        <ConnectStripe
          onConnectStripe={onConnectStripe}
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          keyGranter={keyGranter as string}
          disabled={disabled || connectStripeMutation.isPending}
        />
      )
    }

    if (ConnectStatus.NOT_READY === stripeConnectionState) {
      return (
        <StripeNotReady
          isManager={isManager}
          disabled={
            disabled ||
            connectStripeMutation.isPending ||
            disconnectStipeMutation.isPending
          }
          onConnectStripe={onConnectStripe}
          onDisconnect={onDisconnectStripe}
          connectedStripeAccount={connectedStripeAccount}
        />
      )
    }

    if (ConnectStatus.CONNECTED === stripeConnectionState) {
      return (
        <div className="grid gap-4">
          <DisconnectStripe
            isManager={isManager}
            onDisconnect={onDisconnectStripe}
            disabled={disabled || disconnectStipeMutation.isPending}
          />

          {connectedStripeAccount && (
            <p className="text-sm text-gray-700">
              You will receive payments on your Stripe account{' '}
              <code className="text-gray-600">{connectedStripeAccount.id}</code>
              .
            </p>
          )}

          <CreditCardCustomPrice
            lockAddress={lockAddress}
            network={network}
            disabled={disabled}
            lock={lock}
            currencies={supportedCurrencies}
            connectedStripeAccount={connectedStripeAccount}
          />
        </div>
      )
    }
    return null
  }, [
    stripeConnectionState,
    onConnectStripe,
    lockAddress,
    network,
    isManager,
    keyGranter,
    disabled,
    connectStripeMutation.isPending,
    onDisconnectStripe,
    connectedStripeAccount,
    disconnectStipeMutation.isPending,
    lock,
    stripeConnectionDetails,
  ])

  if (loading)
    return (
      <Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line size="xl" />
      </Placeholder.Root>
    )

  return (
    <div className="flex flex-col gap-2">
      {StatusComponent}
      {isPricingLow && (
        <span className="text-sm text-red-600">
          Your current price is too low for us to process credit cards. It needs
          to be at least $0.50.
        </span>
      )}
    </div>
  )
}
