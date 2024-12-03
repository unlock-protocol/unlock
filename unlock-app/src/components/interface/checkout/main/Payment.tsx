import Image from 'next/image'
import { ethers } from 'ethers'
import { CheckoutService } from './checkoutMachine'

import { useConfig } from '~/utils/withConfig'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Fragment } from 'react'
import {
  RiVisaLine as VisaIcon,
  RiMastercardLine as MasterCardIcon,
} from 'react-icons/ri'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useBalance } from '~/hooks/useBalance'
import LoadingIcon from '../../Loading'
import { formatNumber } from '~/utils/formatter'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'
import { useCanClaim } from '~/hooks/useCanClaim'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useCrossmintEnabled } from '~/hooks/useCrossmintEnabled'
import { useCrossChainRoutes } from '~/hooks/useCrossChainRoutes'
import { usePricing } from '~/hooks/usePricing'
import Link from 'next/link'
import Disconnect from './Disconnect'
import { TransactionPreparationError } from './TransactionPreparationError'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import InsufficientFundsWarning from '../InsufficientFundsWarning'

interface Props {
  checkoutService: CheckoutService
}

interface AmountBadgeProps {
  symbol: string
  amount: string
}

export const AmountBadge = ({ symbol, amount }: AmountBadgeProps) => {
  return (
    <div>
      <div className="flex items-center gap-x-1 px-2 py-0.5 rounded border font-medium text-sm text-nowrap">
        {Number(amount) <= 0
          ? 'FREE'
          : `${formatNumber(Number(amount))} ${symbol.toUpperCase()}`}
        <CryptoIcon size={16} symbol={symbol} />
      </div>
    </div>
  )
}

// All enabled by default.
const defaultPaymentMethods = {
  crypto: true,
  card: true,
  crossmint: true,
  crosschain: true,
  claim: true,
}

export function Payment({ checkoutService }: Props) {
  const state = useSelector(checkoutService, (state) => state)
  const config = useConfig()
  const { recipients } = state.context
  const lock = state.context.lock!
  const { account } = useAuthenticate()
  const networkConfig = config.networks[lock.network]
  const baseSymbol = networkConfig.nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock, baseSymbol)

  if (recipients.length === 0) {
    recipients.push(account as string)
  } else if (recipients.length > 1 && recipients[0] === '') {
    recipients[0] = account as string
  }

  const configPaymentMethods =
    state.context.paywallConfig.locks[lock.address]?.paymentMethods ||
    state.context.paywallConfig.paymentMethods ||
    {}

  const paymentMethods = {
    ...defaultPaymentMethods,
    ...configPaymentMethods,
  }

  const { isLoading: isLoading, data: enableCreditCard } = useCreditCardEnabled(
    {
      network: lock.network,
      lockAddress: lock.address,
    }
  )

  const { data: purchaseData, isLoading: isPurchaseDataLoading } =
    usePurchaseData({
      lockAddress: lock.address,
      network: lock.network,
      recipients: recipients,
      paywallConfig: state.context.paywallConfig,
      data: state.context.data,
    })

  const {
    data: pricingData,
    isInitialLoading: isPricingDataLoading,
    isError: isPricingDataError,
    refetch: refetchPricingData,
  } = usePricing({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients,
    currencyContractAddress: lock.currencyContractAddress,
    data: purchaseData!,
    paywallConfig: state.context.paywallConfig,
    enabled: !!purchaseData,
    symbol: lockTickerSymbol(lock, baseSymbol),
  })

  const { isLoading: isCrossmintLoading, crossmintEnabled } =
    useCrossmintEnabled({
      network: lock.network,
      lockAddress: lock.address,
      recipients,
    })

  const enableCrossmint = !!crossmintEnabled

  const { isLoading: isBalanceLoading, data: balance } = useBalance({
    account: account!,
    network: lock.network,
    currencyContractAddress: lock.currencyContractAddress,
    requiredAmount: pricingData?.total,
  })

  const { data: canClaim, isLoading: isCanClaimLoading } = useCanClaim(
    {
      lockAddress: lock.address,
      network: lock.network,
      recipients: recipients,
      data: purchaseData || [],
    },
    {
      enabled: !isPurchaseDataLoading,
    }
  )

  const isWaiting =
    isLoading || isCrossmintLoading || isBalanceLoading || isPricingDataLoading

  const isReceiverAccountOnly =
    recipients.length <= 1 &&
    recipients[0]?.toLowerCase() === account?.toLowerCase()

  const enableCrypto = true

  const enableClaim: boolean = !!(
    canClaim &&
    !isCanClaimLoading &&
    isReceiverAccountOnly &&
    !balance?.isGasPayable
  )

  const canAfford = balance?.isGasPayable && balance?.isPayable

  const { routes: crosschainRoutes, isLoading: isCrossChaingRoutesLoading } =
    useCrossChainRoutes({
      lock,
      purchaseData,
      context: state.context,
      enabled: !canAfford && !enableClaim,
    })

  const isLoadingMoreRoutes = isCrossChaingRoutesLoading

  const allDisabled = [
    enableCreditCard,
    enableClaim,
    enableCrypto,
    enableCrossmint,
  ].every((item) => !item)

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full p-6 overflow-auto">
        <>
          {isWaiting ? (
            <div className="space-y-6">
              <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
              <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
            </div>
          ) : isPricingDataError ? (
            <TransactionPreparationError
              refetch={refetchPricingData}
              lockAddress={lock.address}
              network={lock.network}
            />
          ) : (
            <div className="space-y-6">
              {/* Card Payment via Stripe! */}
              {enableCreditCard && paymentMethods['card'] && !enableClaim && (
                <button
                  onClick={(event) => {
                    event.preventDefault()
                    checkoutService.send({
                      type: 'SELECT_PAYMENT_METHOD',
                      payment: {
                        method: 'card',
                      },
                    })
                  }}
                  className="flex flex-col w-full p-4 space-y-2 border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-bold"> Pay via card </h3>
                    <div className="flex items-center gap-x-1 px-2 py-0.5 rounded border font-medium text-sm">
                      <VisaIcon size={18} />
                      <MasterCardIcon size={18} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-left text-gray-500">
                      Use cards, Google Pay, or Apple Pay. <br />
                      <span className="text-xs">Additional fees may apply</span>
                    </div>
                    <RightArrowIcon
                      className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                      size={20}
                    />
                  </div>
                </button>
              )}

              {/* Crypto Payment */}
              {enableCrypto && paymentMethods['crypto'] && (
                <button
                  disabled={!canAfford}
                  onClick={(event) => {
                    event.preventDefault()
                    checkoutService.send({
                      type: 'SELECT_PAYMENT_METHOD',
                      payment: {
                        method: 'crypto',
                      },
                    })
                  }}
                  className="grid w-full p-4 space-y-2 text-left border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                >
                  <div className="flex justify-between w-full">
                    <h3 className="font-bold"> Pay with {symbol} </h3>
                    <AmountBadge
                      amount={pricingData?.total.toString() || ''}
                      symbol={symbol}
                    />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center w-full text-sm text-left text-gray-500">
                      Your balance of {symbol?.toUpperCase()} on{' '}
                      {networkConfig.name}:{' ~'}
                      {formatNumber(Number(balance?.balance))}{' '}
                    </div>
                    <RightArrowIcon
                      className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                      size={20}
                    />
                  </div>
                  <div className="inline-flex text-sm text-start">
                    {!balance?.isGasPayable &&
                      `You don't have enough ${baseSymbol} for gas fee.`}
                  </div>
                </button>
              )}

              {/* Crossmint Payment */}
              {enableCrossmint &&
                paymentMethods['crossmint'] &&
                !enableClaim && (
                  <div>
                    <button
                      onClick={(event) => {
                        event.preventDefault()
                        checkoutService.send({
                          type: 'SELECT_PAYMENT_METHOD',
                          payment: {
                            method: 'crossmint',
                          },
                        })
                      }}
                      className="flex flex-col w-full p-4 space-y-2 border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                    >
                      <div className="flex items-center justify-between w-full">
                        <h3 className="font-bold"> Pay via Crossmint </h3>
                        <div className="flex items-center gap-x-1 px-2 py-0.5 rounded border font-medium text-sm">
                          <VisaIcon size={18} />
                          <MasterCardIcon size={18} />
                          <Image
                            alt="Crossmint Logo"
                            src="https://www.crossmint.io/assets/crossmint/logo.svg"
                            width={18}
                            height={18}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-left text-gray-500">
                          Use your card with Crossmint. <br />
                          <span className="text-xs">
                            Additional fees may apply
                          </span>
                        </div>
                        <RightArrowIcon
                          className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                          size={20}
                        />
                      </div>
                    </button>
                  </div>
                )}

              {/* Claim */}
              {enableClaim && paymentMethods['claim'] && (
                <button
                  onClick={(event) => {
                    event.preventDefault()
                    checkoutService.send({
                      type: 'SELECT_PAYMENT_METHOD',
                      payment: {
                        method: 'claim',
                      },
                    })
                  }}
                  className="flex flex-col w-full p-4 space-y-2 border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                >
                  <h3 className="font-bold"> Claim membership for free </h3>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-left text-gray-500">
                      We will airdrop this free membership to you!
                    </div>
                    <div className="flex items-center justify-end">
                      <RightArrowIcon
                        className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                        size={20}
                      />
                    </div>
                  </div>
                </button>
              )}

              {/* Crosschain purchase */}
              {!enableClaim &&
                paymentMethods['crosschain'] &&
                crosschainRoutes?.map((route, index) => {
                  const symbol = route.tokenPayment?.symbol || route.symbol

                  if (!symbol) {
                    // Some routes are returned with Decent without a token
                    console.error('Missing symbol for route', route)
                    return null
                  }
                  return (
                    <button
                      key={index}
                      onClick={(event) => {
                        event.preventDefault()
                        checkoutService.send({
                          type: 'SELECT_PAYMENT_METHOD',
                          payment: {
                            method: 'crosschain_purchase',
                            route,
                          },
                        })
                      }}
                      className="grid w-full p-4 space-y-2 text-left border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                    >
                      <div className="flex justify-between w-full">
                        <h3 className="font-bold">
                          Pay with {symbol} on {route.networkName}
                        </h3>
                        <AmountBadge
                          amount={formatNumber(
                            Number(
                              ethers.formatUnits(
                                route.tokenPayment.amount,
                                route.tokenPayment.decimals
                              )
                            )
                          )}
                          symbol={symbol}
                        />
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="w-full text-sm text-left text-gray-500">
                          Your balance of {symbol?.toUpperCase()} on{' '}
                          {route.networkName}:{' ~'}
                          {formatNumber(Number(route.userTokenBalance))}.
                          Payment through
                          <Link
                            className="underline ml-1"
                            target="_blank"
                            href={route.provider.url}
                          >
                            {route.provider.name}
                          </Link>
                          .
                        </div>
                        <RightArrowIcon
                          className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                          size={20}
                        />
                      </div>
                    </button>
                  )
                })}

              {/* Loading details */}
              {isLoadingMoreRoutes && !enableClaim && (
                <div className="flex items-center justify-center w-full gap-2 text-sm text-center">
                  <LoadingIcon size={16} /> Loading more payment options...
                </div>
              )}

              {/* All disabled */}
              {allDisabled && (
                <div className="text-sm">
                  <p className="mb-4">
                    Credit card payments have not been enabled for this
                    membership.
                  </p>
                </div>
              )}
            </div>
          )}
        </>

        <InsufficientFundsWarning
          enableCreditCard={!!enableCreditCard}
          enableClaim={!!enableClaim}
          isCrossChainRoutesLoading={isCrossChaingRoutesLoading}
          hasCrossChainRoutes={Boolean(
            crosschainRoutes && crosschainRoutes.length > 0
          )}
          checkoutService={checkoutService}
        />
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
