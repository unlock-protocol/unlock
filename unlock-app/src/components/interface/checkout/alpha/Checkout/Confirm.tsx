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
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useAccount from '~/hooks/useAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { LabeledItem } from '../LabeledItem'
import { Framework } from '@superfluid-finance/sdk-core'
import { ethers, BigNumber } from 'ethers'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useCheckoutSteps } from './useCheckoutItems'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication: CheckoutCommunication
}

export function Confirm({
  injectedProvider,
  checkoutService,
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

  const {
    lock,
    quantity,
    recipients,
    payment,
    captcha,
    messageToSign,
    paywallConfig,
    password,
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
        communication.emitTransactionInfo({
          hash: response.transactionHash,
          lock: lockAddress,
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
      const referrers: string[] | undefined = paywallConfig.referrer
        ? new Array(recipients!.length).fill(paywallConfig.referrer)
        : undefined
      await walletService?.purchaseKeys(
        {
          lockAddress,
          keyPrices,
          owners: recipients!,
          data: password?.length ? password : captcha,
          recurringPayments,
          referrers,
        },
        (error, hash) => {
          setIsConfirming(false)
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

  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper position={7} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 space-y-2 overflow-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold">
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
                  {!!fiatPrice && <span>${(fiatPrice / 100).toFixed(2)}</span>}
                </>
              )}
              <p className="text-sm text-gray-500">
                {quantity} X {formattedData.formattedKeyPrice}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="w-full border-t"></div>
        {!isLoading ? (
          <div className="py-2 space-y-1">
            <ul className="flex items-center gap-4 text-sm">
              <LabeledItem
                label="Duration"
                icon={DurationIcon}
                value={formattedData.formattedDuration}
              />
              {!!(
                recurringPayments?.length &&
                recurringPayment &&
                payment.method === 'crypto'
              ) && (
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
              className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
            >
              View Contract <Icon icon={ExternalLinkIcon} size="small" />
            </a>
          </div>
        ) : (
          <div className="py-1.5 space-y-2 items-center">
            <div className="p-2 bg-gray-100 rounded-lg w-52 animate-pulse"></div>
            <div className="p-2 bg-gray-100 rounded-lg w-52 animate-pulse"></div>
          </div>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Payment />
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
