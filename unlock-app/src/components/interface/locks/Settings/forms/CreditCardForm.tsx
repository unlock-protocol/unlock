import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { Button, Badge } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import useAccount from '~/hooks/useAccount'
import useLock from '~/hooks/useLock'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { BsCheckCircle as CheckCircleIcon } from 'react-icons/bs'

enum ConnectStatus {
  CONNECTED = 1,
  NOT_READY = 0,
  NO_ACCOUNT = -1,
}

interface CardPaymentProps {
  lockAddress: string
  network: number
}

interface DetailProps {
  title: string
  description: string
}

const CardPaymentPlaceholder = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="h-5 w-44 bg-slate-200 animate-pulse"></div>
        <div className="flex flex-col gap-1">
          <div className="w-1/3 h-3 bg-slate-200 animate-pulse"></div>
          <div className="w-2/3 h-3 bg-slate-200 animate-pulse"></div>
        </div>
        <div className="w-1/3 h-10 rounded-full bg-slate-200 animate-pulse"></div>
      </div>
    </>
  )
}

const Detail = ({ title, description }: DetailProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-base font-bold text-gray-700">{title}</span>
      <span className="text-sm text-gray-700">{description}</span>
    </div>
  )
}

export const CreditCardForm = ({ lockAddress, network }: CardPaymentProps) => {
  const { account } = useAuth()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()
  const { isStripeConnected, getCreditCardPricing } = useLock(
    { address: lockAddress },
    network
  )
  const { connectStripeToLock, disconnectStripeFromLock } = useAccount(
    account!,
    network!
  )

  const [hasRole, setHasRole] = useState(false)

  const getKeyGranter = async () => {
    return await storageService.getKeyGranter(network)
  }

  const checkIsKeyGranter = async (keyGranter: string) => {
    return await web3Service.isKeyGranter(lockAddress, keyGranter, network)
  }

  const connectStripe = async (): Promise<any> => {
    return await connectStripeToLock(
      lockAddress,
      network,
      window.location.origin
    )
  }

  const disconnectStipeMutation = useMutation(disconnectStripeFromLock, {
    onSuccess: (res: any) => {
      if (res.ok) {
        ToastHelper.success('Stripe disconnected')
      } else {
        ToastHelper.error(`Can't disconnect Stripe, please try again`)
      }
    },
  })

  const connectStripeMutation = useMutation(connectStripe, {
    onSuccess: (redirectUrl?: string) => {
      if (!redirectUrl) {
        return ToastHelper.error(
          'We could not connect your lock to a Stripe account. Please try again later.'
        )
      }
      window.location.href = redirectUrl
    },
  })

  const [
    { isLoading, data: isConnected = 0 },
    { isLoading: isLoadingKeyGranter, data: keyGranter },
    { isLoading: isLoadingPricing, data: fiatPricing },
  ] = useQueries({
    queries: [
      {
        queryKey: [
          'isStripeConnected',
          lockAddress,
          network,
          hasRole,
          disconnectStipeMutation.isSuccess,
          connectStripeMutation.isSuccess,
        ],
        queryFn: isStripeConnected,
      },
      {
        queryKey: [
          'getKeyGranter',
          lockAddress,
          network,
          hasRole,
          disconnectStipeMutation.isSuccess,
          connectStripeMutation.isSuccess,
        ],
        queryFn: getKeyGranter,
      },
      {
        queryKey: ['getCreditCardPricing', lockAddress, network],
        queryFn: getCreditCardPricing,
      },
    ],
  })

  const isPricingLow = fiatPricing?.usd?.keyPrice < 50

  const { isLoading: isLoadingCheckGrantedStatus, data: isGranted } = useQuery(
    [
      'checkIsKeyGranter',
      lockAddress,
      network,
      hasRole,
      keyGranter,
      disconnectStipeMutation.isSuccess,
      connectStripeMutation.isSuccess,
    ],
    async () => {
      return checkIsKeyGranter(keyGranter)
    }
  )

  const loading =
    isLoading ||
    isLoadingKeyGranter ||
    isLoadingCheckGrantedStatus ||
    isLoadingPricing

  const grantKeyGrantorRole = async (): Promise<any> => {
    return await walletService.addKeyGranter({
      lockAddress,
      keyGranter,
    })
  }

  const grantKeyGrantorRoleMutation = useMutation(grantKeyGrantorRole, {
    onSuccess: (hasRole: boolean) => {
      setHasRole(hasRole)
    },
  })

  const onGrantKeyRole = async () => {
    await ToastHelper.promise(grantKeyGrantorRoleMutation.mutateAsync(), {
      error: `Can't grant role, please try again.`,
      success: 'Key granted',
      loading: 'Allow key granting',
    })
  }

  const ConnectStripe = () => {
    return (
      <div className="flex flex-col gap-4">
        <Detail
          title="Connect Stripe to Your Account"
          description="In order to enable the credit card payment, please connect Stripe
          via your account."
        />
        <div className="flex flex-col gap-3">
          <Button
            variant="outlined-primary"
            size="small"
            className="w-full md:w-1/3"
            onClick={() => connectStripeMutation.mutate()}
          >
            Connect
          </Button>
        </div>
      </div>
    )
  }

  const DisconnectStripe = () => {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs">
          {isGranted ? (
            <Detail
              title="Credit card payment ready"
              description="Member of this Lock can now pay with credit card or crypto as they wish. "
            />
          ) : (
            <Detail
              title="Enable Contract to Accept Credit Card"
              description="Please accept Unlock Protocol will be processing this for you. Service & credit card processing fee will apply on your member’s purchase."
            />
          )}
        </span>
        <div className="flex flex-col items-center gap-4 md:gap-8 md:flex-row">
          {isGranted ? (
            <Badge variant="green" className="justify-center w-full md:w-1/3">
              <div className="flex items-center gap-2">
                <span>Payment method enabled</span>
                <CheckCircleIcon />
              </div>
            </Badge>
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
          <Button
            size="small"
            variant="borderless"
            className="text-brand-ui-primary"
            disabled={disconnectStipeMutation.isLoading}
            onClick={() =>
              disconnectStipeMutation.mutate({
                lockAddress,
                network,
              })
            }
          >
            Disconnect Stripe
          </Button>
        </div>
      </div>
    )
  }

  const Status = () => {
    if (
      [ConnectStatus.NOT_READY, ConnectStatus.NO_ACCOUNT].includes(isConnected)
    ) {
      return <ConnectStripe />
    }

    if ([ConnectStatus.CONNECTED].includes(isConnected)) {
      return <DisconnectStripe />
    }
    return null
  }

  if (loading) return <CardPaymentPlaceholder />

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
