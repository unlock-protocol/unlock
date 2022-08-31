import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useConfig } from '~/utils/withConfig'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { useQuery } from 'react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { lockTickerSymbol, userCanAffordKey } from '~/utils/checkoutLockUtils'
import dynamic from 'next/dynamic'
import { useWalletService } from '~/utils/withWalletService'
import { Fragment, useEffect, useState } from 'react'
import {
  RiVisaLine as VisaIcon,
  RiMastercardLine as MasterCardIcon,
} from 'react-icons/ri'
import useAccount from '~/hooks/useAccount'
import { useStorageService } from '~/utils/withStorageService'
import { useCheckoutSteps } from './useCheckoutItems'

const CryptoIcon = dynamic(() => import('react-crypto-icons'), {
  ssr: false,
})

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Payment({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()

  const { paywallConfig, quantity, recipients } = state.context
  const lock = state.context.lock!
  const wallet = useWalletService()
  const { account, network, isUnlockAccount } = useAuth()
  const { getTokenBalance } = useAccount(account!, network!)
  const [isTokenBalanceLoading, setIsTokenBalanceLoading] = useState(true)
  const [balance, setBalance] = useState<string | null>(null)
  const storageService = useStorageService()
  const baseSymbol = config.networks[lock.network].baseCurrencySymbol
  const symbol = lockTickerSymbol(lock, baseSymbol)
  const isPayable = balance
    ? userCanAffordKey(lock as any, balance, recipients.length)
    : false
  const balanceAmount = balance

  const { isLoading, data: fiatPricing } = useQuery(
    ['fiat', quantity, lock.address, lock.network],
    async () => {
      const pricing = await getFiatPricing(
        config,
        lock.address,
        lock.network,
        quantity
      )
      return pricing
    }
  )

  const { isLoading: isClaimableLoading, data: isClaimable } = useQuery(
    ['claim', lock.address, lock.network],
    () => {
      return storageService.canClaimMembership({
        network: lock.network,
        lockAddress: lock.address,
      })
    }
  )

  useEffect(() => {
    const getBalance = async () => {
      if (account) {
        const balance = await getTokenBalance(lock!.currencyContractAddress!)
        setBalance(balance)
        setIsTokenBalanceLoading(false)
      }
    }
    getBalance()
  }, [account, wallet, setBalance, lock, getTokenBalance])

  const lockConfig = paywallConfig.locks[lock!.address]

  const isReceiverAccountOnly =
    recipients.length <= 1 && recipients[0] === account

  const enableSuperfluid =
    (paywallConfig.superfluid || lockConfig.superfluid) && isReceiverAccountOnly

  const enableClaim =
    !!isClaimable && !isClaimableLoading && isReceiverAccountOnly

  const enableCreditCard = !!fiatPricing?.creditCardEnabled

  const enableCrypto = isPayable && !isUnlockAccount && !isTokenBalanceLoading

  const isWaiting = isLoading || isClaimableLoading || isTokenBalanceLoading

  const stepItems = useCheckoutSteps(checkoutService)

  const allDisabled = [
    enableCreditCard,
    enableClaim,
    enableCrypto,
    enableSuperfluid,
  ].every((item) => !item)

  return (
    <Fragment>
      <Stepper position={4} service={checkoutService} items={stepItems} />
      <main className="h-full p-6 overflow-auto ">
        {isWaiting ? (
          <div className="space-y-6">
            <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
            <div className="w-full h-24 rounded-lg bg-zinc-50 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {enableCrypto && (
              <button
                disabled={!isPayable || isLoading}
                onClick={(event) => {
                  event.preventDefault()
                  send({
                    type: 'SELECT_PAYMENT_METHOD',
                    payment: {
                      method: 'crypto',
                    },
                  })
                }}
                className="flex flex-col w-full p-4 space-y-2 border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                <div className="flex justify-between w-full">
                  <h3 className="font-bold"> Pay via cryptocurrency </h3>
                  <div className="flex items-center gap-x-1 px-2 py-0.5 rounded border font-medium text-sm">
                    {symbol.toUpperCase()}
                    <CryptoIcon name={symbol.toLowerCase()} size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center w-full text-sm text-left text-gray-500">
                    Your balance ({symbol.toUpperCase()})
                    <p className="w-20 ml-2 font-medium truncate">
                      {balanceAmount?.toString()}
                    </p>
                  </div>
                  <RightArrowIcon
                    className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                    size={20}
                  />
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
                  <h3 className="font-bold"> Pay via credit card </h3>
                  <div className="flex items-center text-sm gap-x-2">
                    Accept:
                    <VisaIcon size={18} />
                    <MasterCardIcon size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-left text-gray-500">
                    Powered by stripe
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
            {enableSuperfluid && (
              <button
                disabled={isLoading}
                onClick={(event) => {
                  event.preventDefault()
                  send({
                    type: 'SELECT_PAYMENT_METHOD',
                    payment: {
                      method: 'superfluid',
                    },
                  })
                }}
                className="flex flex-col w-full p-4 space-y-2 border border-gray-400 rounded-lg shadow cursor-pointer group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold"> Pay via superfluid </h3>
                  <div className="flex items-center text-sm gap-x-2">
                    Accept: <CryptoIcon name={symbol} size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-left text-gray-500">
                    Superfluid allows you to stream payment.
                  </div>
                  <RightArrowIcon
                    className="transition-transform duration-300 ease-out group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:transition-none group-disabled:group-hover:fill-black"
                    size={20}
                  />
                </div>
              </button>
            )}
            {allDisabled && (
              <div>
                <p className="text-sm">
                  No payment option is available to pay for the lock. You need
                  to connect a crypto wallet with balance or ask creator to
                  enable credit card payments.
                </p>
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
