import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from '@tanstack/react-query'
import { useConfig } from '~/utils/withConfig'
import { Badge, Button, minifyAddress } from '@unlock-protocol/ui'
import { Fragment, useRef, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useWeb3Service } from '~/utils/withWeb3Service'
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
import { ethers } from 'ethers'
import { formatNumber } from '~/utils/formatter'
import { useFiatChargePrice } from '~/hooks/useFiatChargePrice'
import { useCapturePayment } from '~/hooks/useCapturePayment'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'
import { ConfirmCard } from './Confirm/ConfirmCard'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

interface PricingDataProps {
  pricingData: any
  lock: Lock
  network: number
  payment?: any
}

export function PricingData({ pricingData, lock, payment }: PricingDataProps) {
  return (
    <div>
      {!!pricingData?.prices?.length &&
        pricingData.prices.map((item: any, index: number) => {
          const first = index <= 0
          const discount =
            Number(lock!.keyPrice) > 0
              ? (100 * (Number(lock!.keyPrice) - item.amount)) /
                Number(lock!.keyPrice)
              : 0
          const symbol = payment?.route
            ? payment.route.trade.inputAmount.currency.symbol
            : item.symbol

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
                {item.amount <= 0
                  ? 'FREE'
                  : payment?.route
                  ? `${formatNumber(
                      payment.route
                        .convertToQuoteToken(item.amount.toString())
                        .toFixed()
                    ).toLocaleString()} ${symbol}`
                  : `${formatNumber(item.amount).toLocaleString()} ${symbol}`}
              </div>
            </div>
          )
        })}
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
  const [isConfirming, setIsConfirming] = useState(false)
  const {
    lock,
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

  const { address: lockAddress, network: lockNetwork, keyPrice } = lock!
  const swap = payment?.method === 'swap_and_purchase'

  const currencyContractAddress = swap
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

  const { data: creditCardEnabled } = useCreditCardEnabled({
    lockAddress,
    network: lockNetwork,
  })

  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

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
    symbol: lockTickerSymbol(
      lock as Lock,
      config.networks[lock!.network].nativeCurrency.symbol
    ),
  })

  const isPricingDataAvailable =
    !isPricingDataLoading && !isPricingDataError && !!pricingData

  const amountToConvert = pricingData?.total || 0

  const { data: totalPricing, isInitialLoading: isTotalPricingDataLoading } =
    useFiatChargePrice({
      tokenAddress: currencyContractAddress,
      amount:
        amountToConvert > 0 && swap
          ? Number(payment.route.convertToQuoteToken(amountToConvert).toFixed())
          : amountToConvert,
      network: lock!.network,
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

      const totalAmount = swap
        ? Number(
            payment.route
              .convertToQuoteToken(pricingData!.total.toString())
              .toFixed()
          )
        : pricingData!.total

      const isTokenPayable = totalAmount <= Number(balance)
      const isGasPayable = Number(networkBalance) > 0 // TODO: improve actual calculation (from estimate!). In the meantime, the wallet should warn them!
      return {
        isTokenPayable,
        isGasPayable,
      }
    },
    {
      enabled: isPricingDataAvailable,
    }
  )

  const { mutateAsync: capturePayment } = useCapturePayment({
    network: lock!.network,
    lockAddress: lock!.address,
    data: purchaseData,
    referrers: recipients.map((recipient) => getReferrer(recipient)),
    recipients,
  })

  // By default, until fully loaded we assume payable.
  const canAfford =
    !isPayable || (isPayable?.isTokenPayable && isPayable?.isGasPayable)

  const isLoading =
    isPricingDataLoading ||
    isInitialDataLoading ||
    isPayableLoading ||
    isTotalPricingDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = swap
    ? payment.route.trade.inputAmount.currency.symbol
    : lockTickerSymbol(lock as Lock, baseCurrencySymbol)

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

      const referrers: string[] = recipients.map((recipient) => {
        return getReferrer(recipient, paywallConfig)
      })

      const stripeIntent = await createPurchaseIntent({
        pricing: totalPricing!.total,
        stripeTokenId: payment.cardId!,
        recipients,
        referrers,
        data: purchaseData!,
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
      const transactionHash = await capturePayment({
        paymentIntent: paymentIntent.id,
      })

      setIsConfirming(false)
      if (transactionHash) {
        send({
          type: 'CONFIRM_MINT',
          transactionHash,
          status: 'PROCESSING',
        })
        communication?.emitTransactionInfo({
          hash: transactionHash,
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
              value: payment.route.value,
              amountInMax: ethers.utils
                .parseUnits(
                  payment.route
                    .convertToQuoteToken(pricingData!.total.toString())
                    .toFixed(payment.route.trade.inputAmount.currency.decimals), // Total Amount
                  payment.route.trade.inputAmount.currency.decimals
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
                  You do not have enough {symbol} to complete this purchase.
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

  console.log(payment.method)

  return (
    <Fragment>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <Stepper service={checkoutService} />
    </Fragment>
  )
}
