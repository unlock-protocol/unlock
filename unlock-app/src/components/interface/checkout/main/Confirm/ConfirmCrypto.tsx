import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useQuery } from '@tanstack/react-query'
import { useConfig } from '~/utils/withConfig'
import { Badge, Button, minifyAddress } from '@unlock-protocol/ui'
import { Fragment, useRef, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { MAX_UINT } from '~/constants'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import ReCaptcha from 'react-google-recaptcha'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { ViewContract } from '../../ViewContract'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { formatNumber } from '~/utils/formatter'
import { useFiatChargePrice } from '~/hooks/useFiatChargePrice'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'

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

export function ConfirmCrypto({
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

  const currencyContractAddress = lock?.currencyContractAddress

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
    currencyContractAddress,
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
      amount: amountToConvert,
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

      const totalAmount = pricingData!.total

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

  // By default, until fully loaded we assume payable.
  const canAfford =
    !isPayable || (isPayable?.isTokenPayable && isPayable?.isGasPayable)

  const isLoading =
    isPricingDataLoading ||
    isInitialDataLoading ||
    isPayableLoading ||
    isTotalPricingDataLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock as Lock, baseCurrencySymbol)

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

  const onConfirmCrypto = async () => {
    try {
      setIsConfirming(true)
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
        },
        {} /** Transaction params */,
        onErrorCallback
      )
    } catch (error: any) {
      setIsConfirming(false)
      onError(error)
    }
  }

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
    <Fragment>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
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
            <PricingData
              network={lockNetwork}
              lock={lock!}
              pricingData={pricingData}
              payment={payment}
            />
          )}
        </div>
        {!isPricingDataAvailable && (
          <div>
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
                    : `${formatNumber(
                        pricingData!.total
                      ).toLocaleString()} ${symbol}`
                }
                usdPrice={
                  totalPricing?.total
                    ? `~${formatNumber(totalPricing?.total).toLocaleString()}`
                    : ''
                }
                isCardEnabled={!!creditCardEnabled}
              />
            )}
          </div>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
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
                    {config.networks[lock!.network].nativeCurrency.symbol} to
                    pay transaction fees (gas).
                  </small>
                )}
              </>
            )}
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
