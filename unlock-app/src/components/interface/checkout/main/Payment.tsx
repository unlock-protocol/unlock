import { CheckoutService } from './checkoutMachine'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
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
import { useIsClaimable } from '~/hooks/useIsClaimable'
import {
  useUniswapRoutes,
  useUniswapRoutesUsingLock,
} from '~/hooks/useUniswapRoutes'
import { useBalance } from '~/hooks/useBalance'
import LoadingIcon from '../../Loading'
import { formatNumber } from '~/utils/formatter'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'

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
  const baseSymbol = config.networks[lock.network].nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock, baseSymbol)

  const price = Number(parseFloat(lock.keyPrice) * recipients.length)

  const { isLoading: isLoading, data: enableCreditCard } = useCreditCardEnabled(
    {
      network: lock.network,
      lockAddress: lock.address,
    }
  )

  const { isLoading: isClaimableLoading, isClaimable } = useIsClaimable({
    lockAddress: lock.address,
    network: lock.network,
  })

  const { isLoading: isBalanceLoading, data: balance } = useBalance({
    account: account!,
    network: lock.network,
    currencyContractAddress: lock.currencyContractAddress,
  })

  const networkConfig = config.networks[lock.network]

  const uniswapRoutes = useUniswapRoutesUsingLock({
    lock,
    price: price.toString(),
  })

  const isSwapAndPurchaseEnabled =
    price > 0 && uniswapRoutes && uniswapRoutes.length > 0

  const { data: routes, isInitialLoading: isUniswapRoutesLoading } =
    useUniswapRoutes({
      routes: uniswapRoutes!,
      enabled: isSwapAndPurchaseEnabled,
    })

  const isWaiting = isLoading || isClaimableLoading || isBalanceLoading

  const isReceiverAccountOnly =
    recipients.length <= 1 &&
    recipients[0]?.toLowerCase() === account?.toLowerCase()

  const enableCrypto = !isUnlockAccount || !!balance?.isPayable

  const forceClaim = lock.network === 42161

  const enableClaim =
    !!isClaimable &&
    !isClaimableLoading &&
    isReceiverAccountOnly &&
    (!balance?.isPayable || forceClaim)

  const allDisabled = [enableCreditCard, enableClaim, enableCrypto].every(
    (item) => !item
  )

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full p-6 overflow-auto">
        {isWaiting ? (
          <div className="space-y-6">
            <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
            <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {enableCrypto && (
              <button
                disabled={!balance?.isPayable}
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
                  <h3 className="font-bold"> Pay via cryptocurrency </h3>
                  <AmountBadge amount={price.toString()} symbol={symbol} />
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
                    `You don't have enough ${networkConfig.nativeCurrency.symbol} for gas fee.`}
                </div>
              </button>
            )}

            {enableCreditCard && (
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
            {isUniswapRoutesLoading && (
              <div className="flex items-center justify-center w-full gap-2 text-sm text-center">
                <LoadingIcon size={16} /> Loading payment options...
              </div>
            )}
            {!isUniswapRoutesLoading &&
              isSwapAndPurchaseEnabled &&
              routes?.map((route, index) => {
                return (
                  <button
                    key={index}
                    onClick={(event) => {
                      event.preventDefault()
                      send({
                        type: 'SELECT_PAYMENT_METHOD',
                        payment: {
                          route,
                          method: 'swap_and_purchase',
                        },
                      })
                    }}
                    className="grid w-full p-4 space-y-2 text-left border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
                  >
                    <div className="flex justify-between w-full">
                      <h3 className="font-bold"> Swap and purchase </h3>
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
