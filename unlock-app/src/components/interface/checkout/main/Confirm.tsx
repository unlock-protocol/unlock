import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService, FiatPricing } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from '@tanstack/react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Badge, Button, minifyAddress } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { Fragment, useRef, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useAccount, { getAccountTokenBalance } from '~/hooks/useAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useCheckoutSteps } from './useCheckoutItems'
import { MAX_UINT } from '~/constants'
import { Pricing } from '../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import ReCaptcha from 'react-google-recaptcha'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../ViewContract'
import { useClaim } from '~/hooks/useClaim'
import { usePurchase } from '~/hooks/usePurchase'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useUSDPricing } from '~/hooks/useUSDPricing'
import { ethers } from 'ethers'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function CreditCardPricingBreakdown(fiatPricing: FiatPricing) {
  return (
    <div className="mt-6 text-sm">
      <h4 className="text-gray-600 ">
        Credit Card Fees{' '}
        <a
          href="https://unlock-protocol.com/guides/enabling-credit-cards/#faq"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-0.5 rounded-lg gap-2 text-xs hover:bg-gray-100 bg-gray-50 text-gray-500 hover:text-black"
        >
          <span>Learn more</span> <ExternalLinkIcon className="inline" />
        </a>
      </h4>
      <div className="flex justify-between w-full pt-2 text-xs border-t border-gray-300">
        <span className="text-gray-600">Service Fee</span>
        <div>
          ${(fiatPricing?.usd?.unlockServiceFee / 100).toLocaleString()}
        </div>
      </div>
      <div className="flex justify-between w-full pb-2 text-xs ">
        <span className="text-gray-600"> Payment Processor </span>
        <div>
          ${(fiatPricing?.usd?.creditCardProcessing / 100).toLocaleString()}
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
          ).toLocaleString()}
        </div>
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
  const { account, getWalletService } = useAuth()
  const config = useConfig()
  const web3Service = useWeb3Service()
  const recaptchaRef = useRef<any>()
  const { captureChargeForCard } = useAccount(account!)
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
    promo,
    keyManagers,
    metadata,
  } = state.context

  const {
    address: lockAddress,
    network: lockNetwork,
    name: lockName,
    keyPrice,
  } = lock!
  const swap = payment?.method === 'swap_and_purchase'

  const currencyContractAddress =
    payment.method === 'swap_and_purchase'
      ? payment.route.trade.inputAmount.currency?.address
      : lock?.currencyContractAddress

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

  const { mutateAsync: claim } = useClaim({
    lockAddress,
    network: lockNetwork,
  })

  const { mutateAsync: createPurchaseIntent } = usePurchase({
    lockAddress,
    network: lockNetwork,
  })

  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

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
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      promo,
      password,
      captcha,
      paywallConfig,
      recipients,
    })

  const {
    data: pricingData,
    isInitialLoading: isPricingDataLoading,
    isError: isPricingDataError,
  } = usePricing({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients,
    currencyContractAddress: lock?.currencyContractAddress,
    data: purchaseData!,
    paywallConfig,
    enabled: !isInitialDataLoading,
  })

  const isPricingDataAvailable =
    !isPricingDataLoading && !isPricingDataError && !!pricingData

  const amountToConvert = pricingData?.total || 0

  const { data: USDPricingData, isLoading: isUSDPricingDataLoading } =
    useUSDPricing({
      network: lock!.network,
      lockAddress: lock!.address,
      currencyContractAddress,
      amount:
        amountToConvert > 0 && swap
          ? parseFloat(
              payment.route.convertToQuoteToken(amountToConvert).toFixed(4)
            )
          : amountToConvert,
      enabled: isPricingDataAvailable,
    })

  // TODO: run full estimate so we can catch all errors, rather just check balances
  const { data: isPayable, isInitialLoading: isPayableLoading } = useQuery(
    ['canAfford', account, lock, pricingData],
    async () => {
      const [balance, networkBalance] = await Promise.all([
        getAccountTokenBalance(
          web3Service,
          account!,
          currencyContractAddress,
          lock!.network
        ),
        getAccountTokenBalance(web3Service, account!, null, lock!.network),
      ])

      const isTokenPayable = pricingData!.total <= parseFloat(balance)
      const isGasPayable = parseFloat(networkBalance) > 0 // TODO: improve actual calculation (from estimate!). In the meantime, the wallet should warn them!
      return {
        isTokenPayable,
        isGasPayable,
      }
    },
    {
      enabled: isPricingDataAvailable,
    }
  )

  // By default, until fully loaded we assume payable.
  const canAfford =
    !isPayable || (isPayable?.isTokenPayable && isPayable?.isGasPayable) || true

  const isLoading =
    isPricingDataLoading ||
    isFiatPriceLoading ||
    isInitialDataLoading ||
    isPayableLoading ||
    isUSDPricingDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = swap
    ? payment.route.quote.currency.symbol
    : lockTickerSymbol(lock as Lock, baseCurrencySymbol)

  const formattedData = getLockProps(
    lock,
    lockNetwork,
    baseCurrencySymbol,
    lockName,
    quantity
  )

  const onError = (error: any, message?: string) => {
    console.error(error)
    switch (error.code) {
      case -32000:
      case 4001:
      case 'ACTION_REJECTED':
        ToastHelper.error('Transaction rejected.')
        break
      default:
        ToastHelper.error(message || error?.error?.message || error.message)
    }
  }

  const onConfirmCard = async () => {
    try {
      setIsConfirming(true)

      if (payment.method !== 'card') {
        return
      }

      const pricing =
        Object.values(fiatPricing.usd).reduce<number>(
          (t, amount) => t + Number(amount),
          0
        ) / 100

      const stripeIntent = await createPurchaseIntent({
        pricing,
        stripeTokenId: payment.cardId!,
        recipients,
        recurring: recurringPaymentAmount || 0,
      })
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
      send({
        type: 'CONFIRM_MINT',
        status: 'ERROR',
      })
      onError(error)
      setIsConfirming(false)
    }
  }

  const onConfirmCrypto = async () => {
    try {
      setIsConfirming(true)
      if (!['swap_and_purchase', 'crypto'].includes(payment.method)) {
        return
      }
      const keyPrices: string[] =
        pricingData?.prices.map((item) => item.amount.toString()) ||
        new Array(recipients!.length).fill(keyPrice)

      const referrers: string[] = recipients.map((recipient) => {
        return getReferrer(recipient, paywallConfig)
      })

      const onErrorCallback = (error: Error | null, hash: string | null) => {
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

      const swap =
        payment.method === 'swap_and_purchase'
          ? {
              srcTokenAddress: currencyContractAddress,
              uniswapRouter: payment.route.swapRouter,
              swapCallData: payment.route.swapCalldata,
              amountInMax: ethers.utils
                .parseUnits(
                  payment.route
                    .convertToQuoteToken(pricingData!.total.toString())
                    .toFixed(6),
                  payment.route.quote.currency.decimals
                )
                // 1% slippage buffer
                .mul(101)
                .div(100)
                .toString(),
            }
          : undefined

      const walletService = await getWalletService(lockNetwork)
      await walletService.purchaseKeys(
        {
          lockAddress,
          keyPrices,
          owners: recipients!,
          data: purchaseData,
          keyManagers: keyManagers?.length ? keyManagers : undefined,
          recurringPayments,
          referrers,
          totalApproval,
          swap,
        },
        {} /** Transaction params */,
        onErrorCallback
      )
    } catch (error: any) {
      setIsConfirming(false)
      onError(error)
    }
  }

  const onConfirmClaim = async () => {
    try {
      setIsConfirming(true)
      if (payment.method !== 'claim') {
        return
      }

      const captcha = await recaptchaRef.current?.executeAsync()

      const { hash } = await claim({
        data: purchaseData?.[0],
        captcha,
      })

      if (hash) {
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
        new Error('No transaction hash returned')
      }
      setIsConfirming(false)
    } catch (error: any) {
      setIsConfirming(false)
      onError(error, 'Failed to claim membership. Try again.')
    }
  }

  const Payment = () => {
    if (payment.method === 'card') {
      return (
        <div className="grid">
          <Button
            loading={isConfirming}
            disabled={isConfirming || isLoading}
            onClick={async (event) => {
              event.preventDefault()
              if (metadata) {
                await updateUsersMetadata(metadata)
              }
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

    if (payment.method === 'crypto' || payment.method === 'swap_and_purchase') {
      let buttonLabel = ''
      const isFree = pricingData?.prices.reduce((previousTotal, item) => {
        return previousTotal && item.amount === 0
      }, true)

      if (isFree) {
        if (isConfirming) {
          buttonLabel = 'Claiming'
        } else {
          buttonLabel = 'Claim'
        }
      } else {
        if (isConfirming) {
          buttonLabel = 'Paying using crypto'
        } else {
          buttonLabel = 'Pay using crypto'
        }
      }

      return (
        <div className="grid">
          <Button
            loading={isConfirming}
            disabled={
              isConfirming || isLoading || !canAfford || isPricingDataError
            }
            onClick={async (event) => {
              event.preventDefault()
              if (metadata) {
                await updateUsersMetadata(metadata)
              }
              onConfirmCrypto()
            }}
          >
            {buttonLabel}
          </Button>
          {!isLoading && !isPricingDataError && isPayable && (
            <>
              {!isPayable?.isTokenPayable && (
                <small className="text-center text-red-500">
                  You do not have enough{' '}
                  {payment.method === 'swap_and_purchase'
                    ? payment.route.quote?.symbol || 'amount'
                    : symbol}{' '}
                  to complete this purchase.
                </small>
              )}
              {isPayable?.isTokenPayable && !isPayable?.isGasPayable && (
                <small className="text-center text-red-500">
                  You do not have enough{' '}
                  {config.networks[lock!.network].nativeCurrency.symbol} to pay
                  transaction fees (gas).
                </small>
              )}
            </>
          )}
        </div>
      )
    }
    if (payment.method === 'claim') {
      return (
        <div className="grid">
          <Button
            loading={isConfirming}
            disabled={isConfirming || isLoading || isPricingDataError}
            onClick={async (event) => {
              event.preventDefault()
              if (metadata) {
                await updateUsersMetadata(metadata)
              }
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
    return null
  }

  const stepItems = useCheckoutSteps(checkoutService)

  const payingWithCard =
    fiatPricing?.creditCardEnabled && payment?.method === 'card'

  return (
    <Fragment>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <Stepper position={7} service={checkoutService} items={stepItems} />
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <div>
            <h4 className="text-xl font-bold"> {lock!.name}</h4>
            <ViewContract lockAddress={lock!.address} network={lockNetwork} />
          </div>
          {isPricingDataError && (
            // TODO: use actual error from simulation
            <div>
              <p className="text-sm font-bold">
                <ErrorIcon className="inline" />
                There was an error when preparing the transaction.
              </p>
              {password && (
                <p className="text-xs">
                  Please, check that the password you used is correct.
                </p>
              )}
            </div>
          )}
          {!isLoading && isPricingDataAvailable && (
            <div>
              {!!pricingData?.prices?.length &&
                pricingData.prices.map((item, index) => {
                  const first = index <= 0
                  const discount =
                    Number(lock!.keyPrice) > 0
                      ? (100 * (Number(lock!.keyPrice) - item.amount)) /
                        Number(lock!.keyPrice)
                      : 0
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
                        {item.amount < Number(lock!.keyPrice) ? (
                          <Badge variant="green" size="tiny">
                            {discount}% Discount
                          </Badge>
                        ) : null}
                      </div>

                      <div className="font-bold">
                        {(item.amount <= 0
                          ? 'FREE'
                          : swap
                          ? payment.route
                              .convertToQuoteToken(item.amount.toString())
                              .toFixed(6)
                          : item.amount.toLocaleString()) +
                          ' ' +
                          symbol}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
        {!isPricingDataAvailable && (
          <>
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
                  pricingData!.total <= 0
                    ? 'FREE'
                    : `${pricingData!.total.toLocaleString()} ${symbol}`
                }
                usdPrice={
                  USDPricingData?.amount
                    ? `~${USDPricingData.amount.toLocaleString()}`
                    : ''
                }
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
          </>
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
