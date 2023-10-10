import Image from 'next/image'
import { ethers } from 'ethers'
import { CheckoutService } from './checkoutMachine'

import {
  RiExternalLinkLine as ExternalLinkIcon,
  RiErrorWarningFill as ErrorIcon,
} from 'react-icons/ri'
import { Connected } from '../Connected'
import { useConfig } from '~/utils/withConfig'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
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
import { useUniswapRoutes } from '~/hooks/useUniswapRoutes'
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

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface AmountBadgeProps {
  symbol: string
  amount: string
}

const AmountBadge = ({ symbol, amount }: AmountBadgeProps) => {
  return (
    <div className="flex items-center gap-x-1 px-2 py-0.5 rounded border font-medium text-sm">
      {Number(amount) <= 0
        ? 'FREE'
        : `${formatNumber(Number(amount))} ${symbol.toUpperCase()}`}
      <CryptoIcon size={16} symbol={symbol} />
    </div>
  )
}

export function Payment({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()
  const { recipients } = state.context
  const lock = state.context.lock!
  const { account, isUnlockAccount } = useAuth()
  const networkConfig = config.networks[lock.network]
  const baseSymbol = networkConfig.nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock, baseSymbol)

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

  const { isLoading: isCrossmintLoading, crossmintClientId } =
    useCrossmintEnabled({
      network: lock.network,
      lockAddress: lock.address,
      recipients,
    })

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

  const enableCrypto = !isUnlockAccount

  const enableClaim: boolean = !!(
    canClaim &&
    !isCanClaimLoading &&
    isReceiverAccountOnly &&
    !balance?.isGasPayable
  )

  const canAfford = balance?.isGasPayable && balance?.isPayable

  const { data: uniswapRoutes, isInitialLoading: isUniswapRoutesLoading } =
    useUniswapRoutes({
      lock,
      recipients,
      purchaseData,
      paywallConfig: state.context.paywallConfig,
      enabled: !enableClaim && recipients.length === 1, // Disabled swap and purchase for multiple recipients
    })

  const {
    data: crossChainRoutes,
    isInitialLoading: isCrossChaingRoutesLoading,
  } = useCrossChainRoutes({
    lock,
    purchaseData,
    context: state.context,
    enabled: !canAfford && !enableClaim,
  })

  const isLoadingMoreRoutes =
    isUniswapRoutesLoading || isCrossChaingRoutesLoading

  // Universal card is enabled if credit card is not enabled by the lock manager and the lock is USDC
  const USDC = networkConfig?.tokens?.find((t: any) => t.symbol === 'USDC')
  const universalCardEnabled =
    false && // disabled for now
    window.top === window &&
    !enableCreditCard &&
    networkConfig.universalCard?.cardPurchaserAddress &&
    lock.currencyContractAddress?.toLowerCase()?.trim() ===
      USDC?.address?.toLowerCase()?.trim()

  const allDisabled = [
    enableCreditCard,
    enableClaim,
    enableCrypto,
    universalCardEnabled,
    !!crossmintClientId,
  ].every((item) => !item)

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full p-6 overflow-auto">
        {isWaiting ? (
          <div className="space-y-6">
            <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
            <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
          </div>
        ) : isPricingDataError ? (
          <div>
            <p className="text-sm font-bold">
              <ErrorIcon className="inline" />
              There was an error when preparing the transaction.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {enableCrypto && (
              <button
                disabled={!canAfford}
                onClick={(event) => {
                  event.preventDefault()
                  send({
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
                    Your balance of {symbol.toUpperCase()} on{' '}
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

            {crossmintClientId && !enableClaim && (
              <div>
                <button
                  onClick={(event) => {
                    event.preventDefault()
                    send({
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
                      <span className="text-xs">Additional fees may apply</span>
                    </div>
                    <RightArrowIcon
                      className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                      size={20}
                    />
                  </div>
                </button>
              </div>
            )}

            {universalCardEnabled && !enableClaim && (
              <button
                onClick={(event) => {
                  event.preventDefault()
                  send({
                    type: 'SELECT_PAYMENT_METHOD',
                    payment: {
                      method: 'universal_card',
                    },
                  })
                }}
                className="flex flex-col w-full p-4 space-y-2 border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold"> Pay via Stripe </h3>
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

            {enableCreditCard && !enableClaim && (
              <button
                onClick={(event) => {
                  event.preventDefault()
                  send({
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

            {enableClaim && (
              <button
                onClick={(event) => {
                  event.preventDefault()
                  send({
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

            {isLoadingMoreRoutes && !enableClaim && (
              <div className="flex items-center justify-center w-full gap-2 text-sm text-center">
                <LoadingIcon size={16} /> Loading more payment options...
              </div>
            )}

            {!isUniswapRoutesLoading &&
              !enableClaim &&
              uniswapRoutes?.map((route, index) => {
                if (!route) {
                  return null
                }
                return (
                  <button
                    key={index}
                    onClick={(event) => {
                      event.preventDefault()
                      send({
                        type: 'SELECT_PAYMENT_METHOD',
                        payment: {
                          method: 'swap_and_purchase',
                          route,
                        },
                      })
                    }}
                    className="grid w-full p-4 space-y-2 text-left border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                  >
                    <div className="flex justify-between w-full">
                      <h3 className="font-bold">
                        Pay with {route!.trade.inputAmount.currency.symbol}
                      </h3>
                      <AmountBadge
                        amount={route!.quote.toFixed()}
                        symbol={route!.trade.inputAmount.currency.symbol ?? ''}
                      />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center w-full text-sm text-left text-gray-500">
                        Swap {route!.trade.inputAmount.currency.symbol} for{' '}
                        {symbol.toUpperCase()} on {networkConfig.name} and pay{' '}
                      </div>
                      <RightArrowIcon
                        className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                        size={20}
                      />
                    </div>
                  </button>
                )
              })}

            {/* Show cross chain! */}
            {!isCrossChaingRoutesLoading &&
              !enableClaim &&
              crossChainRoutes?.map((route, index) => {
                return (
                  <button
                    key={index}
                    onClick={(event) => {
                      event.preventDefault()
                      send({
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
                        Pay with {route.symbol} on {route.networkName}
                      </h3>
                      <AmountBadge
                        amount={formatNumber(
                          Number(ethers.utils.formatEther(route.tx.value))
                        )}
                        symbol={route.symbol}
                      />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center w-full text-sm text-left text-gray-500">
                        Pay{' '}
                        {formatNumber(
                          Number(ethers.utils.formatEther(route.tx.value))
                        )}{' '}
                        {route.currency} on {route.networkName} through{' '}
                        <Link
                          className="underline ml-1"
                          target="_blank"
                          href="https://www.decent.xyz/"
                        >
                          Decent
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
            {allDisabled && (
              <div className="text-sm">
                <p className="mb-4">
                  Credit card payments have not been enabled for this
                  membership.
                </p>
                {isUnlockAccount && (
                  <>
                    <p className="mb-4">
                      Ready to get your own wallet to purchase this membership
                      with cryptocurrency?{' '}
                      <a
                        href="https://ethereum.org/en/wallets/find-wallet/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 underline"
                      >
                        <span>Click here</span>
                        <ExternalLinkIcon />
                      </a>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
