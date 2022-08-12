import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useConfig } from '~/utils/withConfig'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
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
  const { account, network } = useAuth()
  const { getTokenBalance } = useAccount(account!, network!)
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
      }
    }
    getBalance()
  }, [account, wallet, setBalance, lock, getTokenBalance])

  const isReceiverAccountOnly =
    recipients.length <= 1 && recipients[0] === account

  const enableSuperfluid =
    (paywallConfig.superfluid ||
      paywallConfig.locks[lock!.address].superfluid) &&
    isReceiverAccountOnly

  const enableClaim =
    !!isClaimable && !isClaimableLoading && isReceiverAccountOnly

  const enableCreditCard = !!fiatPricing?.creditCardEnabled

  const isWaiting = isLoading || isClaimableLoading

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <div className="flex items-center gap-0.5">
            <IconButton
              title="Select lock"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('SELECT')
              }}
            />
            <IconButton
              title="Select Quantity"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('QUANTITY')
              }}
            />
            <IconButton
              title="Add metadata"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('METADATA')
              }}
            />
            <ProgressCircleIcon />
          </div>
          <h4 className="text-sm"> Choose payment </h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
        <div className="inline-flex items-center gap-0.5">
          {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishIcon disabled />
        </div>
      </div>
      <main className="p-6 overflow-auto h-full ">
        {isWaiting ? (
          <div className="space-y-6">
            <div className="w-full h-24 bg-zinc-50 rounded-lg animate-pulse" />
            <div className="w-full h-24 bg-zinc-50 rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
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
              className="border flex flex-col w-full border-gray-400 space-y-2 cursor-pointer shadow p-4 rounded-lg group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
            >
              <div className="flex w-full justify-between">
                <h3 className="font-bold"> Pay via cryptocurrency </h3>
                <div className="flex items-center gap-x-1 px-2 py-0.5 rounded border font-medium text-sm">
                  {baseSymbol.toUpperCase()}
                  <CryptoIcon name={symbol.toLowerCase()} size={18} />
                </div>
              </div>
              <div className="flex items-center w-full justify-between">
                <div className="text-sm flex items-center w-full text-left text-gray-500">
                  Your balance
                  <p className="font-medium ml-2 w-20 truncate">
                    {balanceAmount?.toString()}
                  </p>
                </div>
                <RightArrowIcon
                  className="group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 duration-300 ease-out transition-transform group-disabled:transition-none group-disabled:group-hover:fill-black"
                  size={20}
                />
              </div>
            </button>
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
                className="border flex flex-col w-full border-gray-400 space-y-2 cursor-pointer shadow p-4 rounded-lg group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                <div className="items-center flex justify-between w-full">
                  <h3 className="font-bold"> Pay via credit card </h3>
                  <div className="flex items-center gap-x-2 text-sm">
                    Accept:
                    <VisaIcon size={18} />
                    <MasterCardIcon size={18} />
                  </div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500 text-left">
                    Powered by stripe
                  </div>
                  <RightArrowIcon
                    className="group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 duration-300 ease-out transition-transform group-disabled:transition-none group-disabled:group-hover:fill-black"
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
                className="border flex flex-col w-full border-gray-400 space-y-2 cursor-pointer shadow p-4 rounded-lg group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                <h3 className="font-bold"> Claim membership for free </h3>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500 text-left">
                    We will airdrop this free membership to you!
                  </div>
                  <div className="flex items-center justify-end">
                    <RightArrowIcon
                      className="group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 duration-300 ease-out transition-transform group-disabled:transition-none group-disabled:group-hover:fill-black"
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
                className="border flex flex-col w-full border-gray-400 space-y-2 cursor-pointer shadow p-4 rounded-lg group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                <div className="items-center flex justify-between w-full">
                  <h3 className="font-bold"> Pay via superfluid </h3>
                  <div className="flex items-center gap-x-2 text-sm">
                    Accept: <CryptoIcon name={symbol} size={18} />
                  </div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500 text-left">
                    Superfluid allows you to stream payment.
                  </div>
                  <RightArrowIcon
                    className="group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 duration-300 ease-out transition-transform group-disabled:transition-none group-disabled:group-hover:fill-black"
                    size={20}
                  />
                </div>
              </button>
            )}
          </div>
        )}
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
