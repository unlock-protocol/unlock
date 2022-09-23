import { Badge, Button } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useMutation, useQueries, useQuery } from 'react-query'
import useLock from '~/hooks/useLock'
import { useWalletService } from '~/utils/withWalletService'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useStorageService } from '~/utils/withStorageService'
import useAccount from '~/hooks/useAccount'
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

const CardPaymentPlaceholder = () => {
  return (
    <div className="px-4 py-6 border border-gray-400 rounded-2xl">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-44 bg-slate-200 animate-pulse"></div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-3 bg-slate-200 animate-pulse"></div>
          <div className="w-full h-3 bg-slate-200 animate-pulse"></div>
          <div className="w-full h-3 bg-slate-200 animate-pulse"></div>
        </div>
        <div className="w-full h-10 rounded-full bg-slate-200 animate-pulse"></div>
      </div>
    </div>
  )
}

export const CardPayment = ({ lockAddress, network }: CardPaymentProps) => {
  const { account } = useAuth()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()
  const { isStripeConnected } = useLock({ address: lockAddress }, network)
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
        ToastHelper.error('There is some unexpected issue, please try again')
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
  ] = useQueries([
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
  ])

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
    isLoading || isLoadingKeyGranter || isLoadingCheckGrantedStatus

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
      error: 'There is some unexpected issue, please try again',
      success: 'Key granted',
      loading: 'Allow key granting',
    })
  }

  const ConnectStripe = () => {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs">
          Connect Stripe to accept credit cards & ACH payments.
        </span>
        <div className="flex flex-col gap-3">
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => connectStripeMutation.mutate()}
          >
            Connect Stripe
          </Button>
        </div>
      </div>
    )
  }

  const DisconnectStripe = () => {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs">
          {isGranted
            ? 'Member of this Lock can now pay with credit card or crypto as they wish.'
            : 'Accept the credit card processor in order to allow your member pay by credit card. '}
        </span>
        {isGranted ? (
          <Badge variant="green" className="justify-center">
            <div className="flex items-center gap-2">
              <span>Role granted</span>
              <CheckCircleIcon />
            </div>
          </Badge>
        ) : (
          <Button
            size="small"
            variant="outlined-primary"
            onClick={onGrantKeyRole}
            disabled={grantKeyGrantorRoleMutation.isLoading}
          >
            Accept
          </Button>
        )}
        <Button
          size="small"
          variant="transparent"
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
    )
  }

  const Status = () => {
    if (
      [ConnectStatus.NOT_READY, ConnectStatus.NO_ACCOUNT].includes(isConnected)
    ) {
      return <ConnectStripe />
    }

    if ([ConnectStatus.CONNECTED].includes(ConnectStatus.CONNECTED)) {
      return <DisconnectStripe />
    }
    return null
  }

  if (loading) return <CardPaymentPlaceholder />

  return (
    <div className="px-4 py-6 border rounded-2xl border-brand-ui-primary">
      <span className="text-base">Credit card payment</span>
      <div className="mt-4">
        <Status />
      </div>
    </div>
  )
}
