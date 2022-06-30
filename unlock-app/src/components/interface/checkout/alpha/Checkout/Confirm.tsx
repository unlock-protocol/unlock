import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useWalletService } from '~/utils/withWalletService'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useAccount from '~/hooks/useAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import { Shell } from '../Shell'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function Confirm({ injectedProvider, checkoutService, onClose }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, network } = useAuth()
  const walletService = useWalletService()
  const communication = useCheckoutCommunication()
  const config = useConfig()

  const { prepareChargeForCard, captureChargeForCard } = useAccount(
    account!,
    network!
  )
  const [isConfirming, setIsConfirming] = useState(false)

  const {
    lock,
    quantity,
    recipients,
    payment,
    captcha,
    messageToSign,
    paywallConfig,
  } = state.context

  const recurringPayment =
    paywallConfig?.locks[lock!.address]?.recurringPayments

  const recurringPayments: number[] | undefined =
    typeof recurringPayment === 'number'
      ? new Array(recipients.length).fill(
          Math.abs(Math.floor(recurringPayment))
        )
      : undefined

  const { isLoading, data: fiatPricing } = useQuery(
    [quantity, lock!.address, lock!.network],
    async () => {
      const pricing = await getFiatPricing(
        config,
        lock!.address,
        lock!.network,
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
    lock!.network,
    config.networks[lock!.network].baseCurrencySymbol,
    lock!.name,
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
        lock!.address,
        network!,
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
        lock!.address,
        network!,
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
      const keyPrices: string[] = new Array(recipients!.length).fill(
        lock!.keyPrice
      )
      await walletService?.purchaseKeys(
        {
          lockAddress: lock!.address,
          keyPrices,
          owners: recipients!,
          data: captcha,
          recurringPayments,
        },
        (error, hash) => {
          setIsConfirming(true)
          if (error) {
            throw new Error(error.message)
          } else {
            if (!paywallConfig.pessimistic && hash) {
              communication.emitTransactionInfo({
                hash,
                lock: lock?.address,
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

  const Payment = () => {
    switch (payment.method) {
      case 'card': {
        return (
          <div>
            <Button
              className="w-full"
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
          <div>
            <Button
              className="w-full"
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
      default: {
        return null
      }
    }
  }

  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head checkoutService={checkoutService} />
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl">
            {quantity}X {lock!.name}
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
                  {!!fiatPrice && <span>${(fiatPrice / 100).toFixed(2)}</span>}
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
        {!isLoading ? (
          <div className="space-y-1 border-t-2 py-2 border-brand-gray mt-2">
            <ul className="flex items-center gap-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <span className="text-gray-500"> Duration: </span>
                <time>{formattedData.formattedDuration}</time>
              </li>
              {recurringPayments && (
                <li className="inline-flex items-center gap-2">
                  <span className="text-gray-500"> Recurring: </span>
                  <span> {recurringPayment} times </span>
                </li>
              )}
            </ul>
            <a
              href={config.networks[lock!.network].explorer.urls.address(
                lock!.address
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
    </Shell.Root>
  )
}
