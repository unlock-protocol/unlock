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
  previouslyConnectedLocks: any
}

export const CreditCardForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: CardPaymentProps) => {
  const { getWalletService, account } = useAuth()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()
  const { isStripeConnected, getCreditCardPricing } = useLock(
    { address: lockAddress },
    network
  )

  const [hasRole, setHasRole] = useState(false)

  const getKeyGranter = async () => {
    return await storageService.getKeyGranter(network)
  }

  const checkIsKeyGranter = async (keyGranter: string) => {
    return await web3Service.isKeyGranter(lockAddress, keyGranter, network)
  }

  const disconnectStipeMutation = useStripeDisconnect({
    lockAddress,
    network,
  })
  const connectStripeMutation = useStripeConnect({
    lockAddress,
    network,
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

  const {
    isFetching: isFetchingPreviouslyConnectedLocks,
    data: previouslyConnectedLocks,
  } = useQuery(['connectedLocks', account], async () => {
    const response = await storage.getStripeConnections()
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    return response.data.result || []
  })

  const loading =
    isLoading ||
    isLoadingKeyGranter ||
    isLoadingCheckGrantedStatus ||
    isLoadingPricing ||
    isFetchingPreviouslyConnectedLocks

  const grantKeyGrantorRole = async (): Promise<any> => {
    const walletService = await getWalletService(network)
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

  const ConnectStripe = ({ previouslyConnectedLocks }: ConnectStripeProps) => {
    const [stripeAccount, setStripeAccount] = useState<string>()
    return (
      <div className="flex flex-col gap-4">
        {isGranted ? (
          <SettingCardDetail
            title="Connect Stripe to Your Account"
            description="In your application, please refrain from mentioning NFT, and focus on your use case: subscriptions, tickets... etc"
          />
        ) : (
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
                  will usually be charged a higher amount than the amount for
                  your lock. The Unlock Labs fee is 10%, which must be added to
                  the Stripe fees and gas costs.
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
                </span>
              </div>
            }
          />
        )}

        {isManager && (
          <div className="flex flex-col gap-3">
            {isGranted ? (
              <form className="grid gap-4">
                {previouslyConnectedLocks.length > 0 && (
                  <Select
                    onChange={(value: any) => {
                      setStripeAccount(value.toString())
                    }}
                    options={previouslyConnectedLocks
                      .map(
                        ({
                          lock,
                          stripeAccount,
                        }: {
                          lock: string
                          stripeAccount: string
                        }) => {
                          return { label: lock, value: stripeAccount }
                        }
                      )
                      .concat({
                        label: 'Connect a new Stripe account',
                        value: '',
                      })}
                    label="Use the same account as one of your previously connected locks:"
                  />
                )}
                <Button
                  className="w-full md:w-1/3"
                  loading={connectStripeMutation.isLoading}
                  onClick={async (event: any) => {
                    event.preventDefault()
                    connectStripeMutation.mutate(
                      { stripeAccount },
                      {
                        onSuccess: (connect) => {
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
                  }}
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

  const DisconnectStripe = () => {
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

  const Status = () => {
    if (
      [ConnectStatus.NOT_READY, ConnectStatus.NO_ACCOUNT].includes(isConnected)
    ) {
      return (
        <ConnectStripe previouslyConnectedLocks={previouslyConnectedLocks} />
      )
    }

    if ([ConnectStatus.CONNECTED].includes(isConnected)) {
      return <DisconnectStripe />
    }
    return null
  }

  if (loading)
    return (
      <Placeholder.Root>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="ms" />
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
