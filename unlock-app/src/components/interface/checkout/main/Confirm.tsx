import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService, FiatPricing } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from '@tanstack/react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Badge, Button, Icon, minifyAddress } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useWalletService } from '~/utils/withWalletService'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useAccount from '~/hooks/useAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { Framework } from '@superfluid-finance/sdk-core'
import { ethers, BigNumber } from 'ethers'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useCheckoutSteps } from './useCheckoutItems'
import { fetchRecipientsData } from './utils'
import { MAX_UINT } from '~/constants'
import { Pricing } from '../Lock'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { networks } from '@unlock-protocol/networks'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function CreditCardPricingBreakdown(fiatPricing: FiatPricing) {
  return (
    <div className="mt-6">
      <div className="flex justify-between w-full py-2 text-sm border-t border-gray-300">
        <h4 className="text-gray-600"> Service Fee </h4>
        <div className="font-bold">
          ${(fiatPricing?.usd?.unlockServiceFee / 100).toFixed(2)}
        </div>
      </div>
      <div className="flex justify-between w-full py-2 text-sm border-t border-gray-300">
        <h4 className="text-gray-600"> Credit Card Processing </h4>
        <div className="font-bold">
          ${(fiatPricing?.usd?.creditCardProcessing / 100).toFixed(2)}
        </div>
      </div>
      <div className="flex justify-between w-full py-2 text-sm border-t border-gray-300">
        <h4 className="text-gray-600"> Total </h4>
        <div className="font-bold">
          $
          {(
            Object.values(fiatPricing.usd).reduce<number>(
              (t, amount) => t + Number(amount),
              0
            ) / 100
          ).toFixed(2)}
        </div>
      </div>
      <div className="flex">
        <a
          href="https://unlock-protocol.com/guides/enabling-credit-cards/#faq"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-100 bg-gray-50 text-gray-500 hover:text-black"
        >
          <span>Learn more</span>
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  )
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

  const recurringPayment =
    paywallConfig?.recurringPayments ||
    paywallConfig?.locks[lockAddress]?.recurringPayments
  const totalApproval =
    typeof recurringPayment === 'string' &&
    recurringPayment.toLowerCase() === 'forever' &&
    payment.method === 'crypto'
      ? MAX_UINT
      : undefined

  const recurringPaymentAmount = recurringPayment
    ? Math.abs(Math.floor(Number(recurringPayment)))
    : undefined

  const recurringPayments: number[] | undefined = recurringPaymentAmount
    ? new Array(recipients.length).fill(recurringPaymentAmount)
    : undefined

  const { isInitialLoading: isFiatPriceLoading, data: fiatPricing } = useQuery(
    [quantity, lockAddress, lockNetwork],
    async () => {
      const pricing = await getFiatPricing(
        config,
        lockAddress,
        lockNetwork,
        quantity
      )
      return pricing
    },
    {
      refetchInterval: Infinity,
    }
  )

  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    useQuery(
      ['purchaseData', lockAddress, lockNetwork, JSON.stringify(recipients)],
      async () => {
        let purchaseData =
          password || captcha || Array.from({ length: recipients.length })
        const dataBuilder =
          paywallConfig.locks[lock!.address].dataBuilder ||
          paywallConfig.dataBuilder
        // if Data builder url is present, prioritize that above rest.
        if (dataBuilder) {
          const delegatedData = await fetchRecipientsData(dataBuilder, {
            recipients,
            lockAddress: lock!.address,
            network: lock!.network,
          })
          if (delegatedData) {
            purchaseData = delegatedData
          }
        }
        return purchaseData
      },
      {
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        onError(error) {
          console.error(error)
        },
      }
    )

  const { data: pricingData, isInitialLoading: isPricingDataLoading } =
    useQuery(
      ['purchasePriceFor', lockAddress, lockNetwork],
      async () => {
        const prices = await Promise.all(
          recipients.map(async (recipient, index) => {
            const options = {
              lockAddress: lockAddress,
              network: lockNetwork,
              userAddress: recipient,
              referrer: paywallConfig.referrer || recipient,
              data: purchaseData?.[index] || '0x',
            }
            const price = await web3Service.purchasePriceFor(options)

            const decimals = lock!.currencyContractAddress
              ? await web3Service.getTokenDecimals(
                  lock!.currencyContractAddress!,
                  lockNetwork
                )
              : networks[lockNetwork].nativeCurrency?.decimals

            const amount = ethers.utils.formatUnits(price, decimals)
            return {
              userAddress: recipient,
              amount: amount,
            }
          })
        )
        return {
          prices,
          total: prices
            .reduce((acc, item) => acc + parseFloat(item.amount), 0)
            .toString(),
        }
      },
      {
        refetchInterval: Infinity,
        refetchOnMount: false,
        enabled: !isInitialDataLoading,
      }
    )

  const isLoading =
    isPricingDataLoading || isFiatPriceLoading || isInitialDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].baseCurrencySymbol
  const symbol = lockTickerSymbol(lock as Lock, baseCurrencySymbol)
  const formattedData = getLockProps(
    lock,
    lockNetwork,
    baseCurrencySymbol,
    lockName,
    quantity
  )

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
        recipients,
        recurringPaymentAmount || 0
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
        communication?.emitTransactionInfo({
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
      const keyPrices: string[] =
        pricingData?.prices.map((item) => item.amount.toString()) ||
        new Array(recipients!.length).fill(keyPrice)

      const referrers: string[] | undefined = paywallConfig.referrer
        ? new Array(recipients!.length).fill(paywallConfig.referrer)
        : undefined

      await walletService?.purchaseKeys(
        {
          lockAddress,
          keyPrices,
          owners: recipients!,
          data: purchaseData,
          recurringPayments,
          referrers,
          totalApproval,
        },
        {} /** Transaction params */,
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
              communication?.emitTransactionInfo({
                hash,
                lock: lockAddress,
              })
              communication?.emitUserInfo({
                address: account,
                signedMessage: messageToSign?.signature,
              })
            }
            send({
              type: 'CONFIRM_MINT',
              status: paywallConfig.pessimistic ? 'PROCESSING' : 'FINISHED',
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
      communication?.emitUserInfo({
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

      const response = await claimMembershipFromLock(
        lockAddress,
        lockNetwork,
        purchaseData?.[0]
      )

      const { transactionHash: hash, error } = response
      if (hash && !error) {
        communication?.emitTransactionInfo({
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

  const payingWithCard =
    fiatPricing?.creditCardEnabled && payment?.method === 'card'

  return (
    <Fragment>
      <Stepper position={7} service={checkoutService} items={stepItems} />
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <div>
            <h4 className="text-xl font-bold"> {lock!.name}</h4>
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
          {!isLoading && (
            <div>
              {!!pricingData?.prices?.length &&
                pricingData.prices.map((item, index) => {
                  const first = index <= 0
                  return (
                    <div
                      key={index}
                      className={`flex border-b ${
                        first ? 'border-t' : null
                      } items-center justify-between text-sm px-0 py-2`}
                    >
                      <div>
                        1 Key for{' '}
                        <span className="font-medium">
                          {minifyAddress(item.userAddress)}
                        </span>{' '}
                        {Number(item.amount) < Number(lock!.keyPrice) ? (
                          <Badge variant="green" size="tiny">
                            Discounted
                          </Badge>
                        ) : null}
                      </div>

                      <div className="font-bold">
                        {item.amount === '0'
                          ? 'FREE'
                          : item.amount.toString() + ' ' + symbol}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            {recipients.map((user) => (
              <div
                key={user}
                className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <Pricing
            keyPrice={
              pricingData?.total === '0'
                ? 'FREE'
                : `${pricingData?.total?.toString()} ${symbol}`
            }
            usdPrice={`~$${(fiatPricing?.usd?.keyPrice / 100).toFixed()}`}
            isCardEnabled={formattedData.cardEnabled}
          />
        )}
        {isLoading ? (
          <div className="py-1.5 space-y-2 items-center">
            <div className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        ) : (
          <div>
            {!isLoading && payingWithCard && (
              <CreditCardPricingBreakdown {...fiatPricing} />
            )}
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
