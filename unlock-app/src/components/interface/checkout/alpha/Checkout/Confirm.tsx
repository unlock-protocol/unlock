import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button, Icon } from '@unlock-protocol/ui'
import {
  RiExternalLinkLine as ExternalLinkIcon,
  RiTimer2Line as DurationIcon,
  RiRepeatFill as RecurringIcon,
} from 'react-icons/ri'
import { useWalletService } from '~/utils/withWalletService'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useAccount from '~/hooks/useAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import {
  BackButton,
  CheckoutHead,
  CheckoutTransition,
  CloseButton,
} from '../Shell'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
import { LabeledItem } from '../LabeledItem'
import { Framework } from '@superfluid-finance/sdk-core'
import { ethers, BigNumber } from 'ethers'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
  communication: CheckoutCommunication
}

export function Confirm({
  injectedProvider,
  checkoutService,
  onClose,
  communication,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, network } = useAuth()
  const walletService = useWalletService()
  const config = useConfig()
  const web3Service = useWeb3Service()

  const {
    prepareChargeForCard,
    captureChargeForCard,
    claimMembershipFromLock,
  } = useAccount(account!, network!)

  const [isConfirming, setIsConfirming] = useState(false)
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)

  const {
    lock,
    quantity,
    recipients,
    payment,
    captcha,
    messageToSign,
    paywallConfig,
  } = state.context

  const {
    address: lockAddress,
    network: lockNetwork,
    name: lockName,
    keyPrice,
  } = lock!

  const recurringPayment = paywallConfig?.locks[lockAddress]?.recurringPayments

  const recurringPayments: number[] | undefined =
    typeof recurringPayment === 'number'
      ? new Array(recipients.length).fill(
          Math.abs(Math.floor(recurringPayment))
        )
      : undefined

  const { isLoading, data: fiatPricing } = useQuery(
    [quantity, lockAddress, lockNetwork],
    async () => {
      const pricing = await getFiatPricing(
        config,
        lockAddress,
        lockNetwork,
        quantity
      )
      return pricing
    }
  )

  const formattedData = getLockProps(
    {
      ...lock,
      fiatPricing,
    },
    lockNetwork,
    config.networks[lockNetwork].baseCurrencySymbol,
    lockName,
    quantity
  )

  const fiatPrice = fiatPricing?.usd?.keyPrice

  const onConfirmCard = async () => {
    try {
      setIsConfirming(true)
      if (payment.method !== 'card') {
        return
      }
      const stripeIntent = await prepareChargeForCard(
        payment.cardId!,
        lockAddress,
        lockNetwork,
        formattedData.formattedKeyPrice,
        recipients
      )

      if (stripeIntent?.error) {
        throw new Error(stripeIntent.error)
      }
      if (!stripeIntent?.clientSecret) {
        throw new Error('Creating payment intent failed')
      }
      const stripe = await loadStripe(config.stripeApiKey, {
        stripeAccount: stripeIntent.stripeAccount,
      })

      if (!stripe) {
        throw new Error('There was a problem in loading stripe')
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(
        stripeIntent.clientSecret
      )

      if (!paymentIntent) {
        throw new Error('Payment intent is missing. Please retry.')
      }

      if (paymentIntent.status !== 'requires_capture') {
        const confirmation = await stripe.confirmCardPayment(
          stripeIntent.clientSecret
        )
        if (
          confirmation.error ||
          confirmation.paymentIntent?.status !== 'requires_capture'
        ) {
          throw new Error('We could not confirm your payment.')
        }
      }
      const response = await captureChargeForCard(
        lockAddress,
        lockNetwork,
        recipients,
        paymentIntent.id
      )

      setIsConfirming(false)
      if (response.transactionHash) {
        send({
          type: 'CONFIRM_MINT',
          transactionHash: response.transactionHash,
          status: 'PROCESSING',
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        send({
          type: 'CONFIRM_MINT',
          status: 'ERROR',
        })
        ToastHelper.error(error.message)
      }
      setIsConfirming(false)
    }
  }

  const onConfirmCrypto = async () => {
    try {
      setIsConfirming(true)
      if (payment.method !== 'crypto') {
        return
      }
      const keyPrices: string[] = new Array(recipients!.length).fill(keyPrice)
      await walletService?.purchaseKeys(
        {
          lockAddress,
          keyPrices,
          owners: recipients!,
          data: captcha,
          recurringPayments,
        },
        (error, hash) => {
          setIsConfirming(true)
          if (error) {
            send({
              type: 'CONFIRM_MINT',
              status: 'ERROR',
              transactionHash: hash!,
            })
          } else {
            if (!paywallConfig.pessimistic && hash) {
              communication.emitTransactionInfo({
                hash,
                lock: lockAddress,
              })
              communication.emitUserInfo({
                address: account,
                signedMessage: messageToSign?.signature,
              })
            }
            send({
              type: 'CONFIRM_MINT',
              status: 'PROCESSING',
              transactionHash: hash!,
            })
          }
        }
      )
    } catch (error: any) {
      setIsConfirming(false)
      ToastHelper.error(error?.error?.message || error.message)
    }
  }

  const onConfirmSuperfluid = async () => {
    try {
      if (payment.method !== 'superfluid') {
        return
      }
      setIsConfirming(true)
      const provider = selectProvider(config)
      const web3Provider = new ethers.providers.Web3Provider(provider)
      const sf = await Framework.create({
        chainId: lock!.network,
        provider: web3Provider,
      })
      const expiration = BigNumber.from(lock!.expirationDuration)
      const decimals = await web3Service.getTokenDecimals(
        lock!.currencyContractAddress!,
        lock!.network
      )

      const mul = BigNumber.from(10).pow(decimals)

      const flowRate = BigNumber.from(lock!.keyPrice)
        .mul(mul)
        .div(expiration)
        .toString()
      const op = sf.cfaV1.createFlow({
        sender: provider.address,
        receiver: lock!.address,
        superToken: lock!.currencyContractAddress!,
        flowRate: flowRate,
      })
      const signer = web3Provider.getSigner()
      await op.exec(signer)
      communication.emitUserInfo({
        address: account,
      })
      send({
        type: 'CONFIRM_MINT',
        status: 'FINISHED',
      })
      setIsConfirming(false)
    } catch (error: any) {
      setIsConfirming(false)
      ToastHelper.error(error?.error?.message || error.message)
    }
  }
  const onConfirmClaim = async () => {
    try {
      setIsConfirming(true)
      if (payment.method !== 'claim') {
        return
      }
      const hash = await claimMembershipFromLock(lockAddress, lockNetwork)
      if (hash) {
        communication.emitTransactionInfo({
          hash,
          lock: lockAddress,
        })
        send({
          type: 'CONFIRM_MINT',
          status: 'FINISHED',
          transactionHash: hash,
        })
      } else {
        throw new Error('Failed to claim the membership. Try again')
      }
      setIsConfirming(false)
    } catch (error: any) {
      setIsConfirming(false)
      ToastHelper.error(error?.error?.message || error.message)
    }
  }

  const Payment = () => {
    switch (payment.method) {
      case 'card': {
        return (
          <div className="grid">
            <Button
              loading={isConfirming}
              disabled={isConfirming}
              onClick={(event) => {
                event.preventDefault()
                onConfirmCard()
              }}
            >
              {isConfirming
                ? 'Paying using credit card'
                : 'Pay using credit card'}
            </Button>
          </div>
        )
      }
      case 'crypto': {
        return (
          <div className="grid">
            <Button
              loading={isConfirming}
              disabled={isConfirming}
              onClick={(event) => {
                event.preventDefault()
                onConfirmCrypto()
              }}
            >
              {isConfirming ? 'Paying using crypto' : 'Pay using crypto'}
            </Button>
          </div>
        )
      }
      case 'claim': {
        return (
          <div className="grid">
            <Button
              loading={isConfirming}
              disabled={isConfirming}
              onClick={(event) => {
                event.preventDefault()
                onConfirmClaim()
              }}
            >
              {isConfirming
                ? 'Claiming your membership'
                : 'Claim your membership'}
            </Button>
          </div>
        )
      }
      case 'superfluid': {
        return (
          <div className="grid">
            <Button
              loading={isConfirming}
              disabled={isConfirming}
              onClick={(event) => {
                event.preventDefault()
                onConfirmSuperfluid()
              }}
            >
              {isConfirming
                ? 'Paying using superfluid'
                : 'Pay using superfluid'}
            </Button>
          </div>
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
        <div className="flex items-center justify-between p-6">
          <BackButton onClick={() => send('BACK')} />
          <CloseButton onClick={() => onClose()} />
        </div>
        <CheckoutHead
          title={paywallConfig.title}
          iconURL={iconURL}
          description={description}
        />
        <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <IconButton
                title="Select lock"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('SELECT')
                }}
              />
              <IconButton
                title="Choose quantity"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('QUANTITY')
                }}
              />
              <IconButton
                title="Add metadata"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('METADATA')
                }}
              />
              <IconButton
                title="Select payment method"
                icon={ProgressCircleIcon}
                onClick={() => {
                  send('PAYMENT')
                }}
              />
              {paywallConfig.messageToSign && (
                <IconButton
                  title="Sign message"
                  icon={ProgressCircleIcon}
                  onClick={() => {
                    send('MESSAGE_TO_SIGN')
                  }}
                />
              )}
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm "> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            <ProgressFinishIcon disabled />
          </div>
        </div>
        <main className="px-6 py-2 overflow-auto h-full space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl">
              {quantity}X {lockName}
            </h3>
            {!isLoading ? (
              <div className="grid">
                {fiatPricing.creditCardEnabled ? (
                  <>
                    {!!fiatPrice && (
                      <span className="font-semibold">
                        ${(fiatPrice / 100).toFixed(2)}
                      </span>
                    )}
                    <span>{formattedData.formattedKeyPrice} </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      {formattedData.formattedKeyPrice}{' '}
                    </span>
                    {!!fiatPrice && (
                      <span>${(fiatPrice / 100).toFixed(2)}</span>
                    )}
                  </>
                )}
                <p className="text-sm text-gray-500">
                  {quantity} X {formattedData.formattedKeyPrice}
                </p>
              </div>
            ) : (
              <div className="flex gap-2 flex-col items-center">
                <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
                <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
              </div>
            )}
          </div>
          <div className="border-t w-full"></div>
          {!isLoading ? (
            <div className="space-y-1 py-2">
              <ul className="flex items-center gap-4 text-sm">
                <LabeledItem
                  label="Duration"
                  icon={DurationIcon}
                  value={formattedData.formattedDuration}
                />
                {recurringPayments && recurringPayment && (
                  <LabeledItem
                    label="Recurring"
                    icon={RecurringIcon}
                    value={recurringPayment.toString()}
                  />
                )}
              </ul>
              <a
                href={config.networks[lockNetwork].explorer.urls.address(
                  lockAddress
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm inline-flex items-center gap-2 text-brand-ui-primary hover:opacity-75"
              >
                View Contract <Icon icon={ExternalLinkIcon} size="small" />
              </a>
            </div>
          ) : (
            <div className="py-1.5 space-y-2 items-center">
              <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
              <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
            </div>
          )}
        </main>
        <footer className="px-6 pt-6 border-t grid items-center">
          <Connected
            injectedProvider={injectedProvider}
            service={checkoutService}
          >
            <Payment />
          </Connected>
          <PoweredByUnlock />
        </footer>
      </div>
    </CheckoutTransition>
  )
}
