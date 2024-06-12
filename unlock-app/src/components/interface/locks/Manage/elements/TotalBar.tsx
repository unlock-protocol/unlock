import { Button, Detail, Card, PriceFormatter } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { VscGraphLine as GraphIcon } from 'react-icons/vsc'
import { useLockManager } from '~/hooks/useLockManager'
import { WithdrawFundModal } from './WithdrawFundModal'
import useLock from '~/hooks/useLock'
import Link from 'next/link'

interface TotalsProps {
  lockAddress: string
  network: number
}

export const TotalBar = ({ lockAddress, network }: TotalsProps) => {
  const [showStats, setShowStats] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(false)
  const web3Service = useWeb3Service()
  const { networks } = useConfig()
  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  const baseCurrencySymbol =
    network && networks?.[network].nativeCurrency.symbol

  const getNumberOfOwners = async () => {
    return await web3Service.numberOfOwners(lockAddress, network)
  }

  const { isStripeConnected } = useLock({ address: lockAddress }, network)

  const getLock = async () => {
    return await web3Service.getLock(lockAddress, network)
  }

  const [
    { isLoading, data: lock, refetch },
    { isLoading: isLoadingTotalMembers, data: numberOfOwners },
    { isLoading: isLoadingStripeConnected, data: stripeConnected },
  ] = useQueries({
    queries: [
      {
        queryKey: ['getLock', lockAddress, network],
        queryFn: getLock,
      },
      {
        queryKey: ['totalMembers', lockAddress, network],
        queryFn: getNumberOfOwners,
      },
      {
        queryKey: ['isStripeConnected', lockAddress, network],
        queryFn: isStripeConnected,
      },
    ],
  })

  const { balance = 0, outstandingKeys: keySold = 0 } = lock ?? {}

  const loading = isLoading || isLoadingTotalMembers || isLoadingStripeConnected

  const withdrawDisabled = false // parseFloat(`${balance}`) === 0) || loading

  const symbol = lock?.currencySymbol || baseCurrencySymbol

  const wrapperClass =
    'pt-4 pb-4 md:pb-0 first-of-type:pt-0 md:py-0 md:pl-4 grow shrink-0 basis-0'

  const Stats = () => {
    return (
      <>
        <div className="grid w-full grid-cols-1 divide-y md:gap-0 md:grid-cols-3 md:divide-y-0 md:divide-x divide-x-gray-500">
          <div className={wrapperClass}>
            <Detail label="Total members" loading={loading} valueSize="large">
              {numberOfOwners?.toString()}
            </Detail>
          </div>
          <div className={wrapperClass}>
            <Detail label="Key Minted" loading={loading} valueSize="large">
              {keySold}
            </Detail>
          </div>
          <div className={wrapperClass}>
            <Detail
              label={
                <div className="flex items-start gap-4">
                  <p>Balance</p>
                </div>
              }
              valueSize="large"
              loading={loading}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <CryptoIcon symbol={symbol} size={36} />
                <span className="overflow-hidden">
                  <PriceFormatter price={balance} precision={2} />
                </span>
                {isManager && (
                  <Button
                    variant="outlined-primary"
                    size="tiny"
                    onClick={() => setWithdrawModal(true)}
                    disabled={withdrawDisabled}
                  >
                    <div className="flex gap-1 flex-items-center">
                      <span>Withdraw</span>
                    </div>
                  </Button>
                )}
              </div>
            </Detail>
            {stripeConnected ? (
              <p className="text-xs mt-2">
                Check{' '}
                <Link
                  target="_blank"
                  href="https://stripe.com/"
                  className="underline"
                >
                  Stripe
                </Link>{' '}
                for card payments.
              </p>
            ) : (
              ''
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <Card variant="transparent" className="flex flex-col">
      {withdrawModal && (
        <WithdrawFundModal
          isOpen={withdrawModal}
          setIsOpen={setWithdrawModal}
          lockAddress={lockAddress}
          currencyContractAddress={lock?.currencyContractAddress}
          balance={balance}
          symbol={symbol}
          network={network}
          dismiss={() => {
            refetch()
          }}
        />
      )}
      <div className="hidden md:block">
        <Stats />
      </div>
      <div
        className={`flex ${
          showStats ? 'flex-col-reverse' : 'flex-col'
        } px-4 py-3 md:hidden`}
      >
        <button
          className={`flex ${
            showStats ? 'mt-4' : ''
          } items-center justify-between md:hidden`}
          onClick={() => setShowStats(!showStats)}
        >
          <span className="text-sm font-semibold">
            {showStats ? 'Hide' : 'Stats'}
          </span>
          <GraphIcon size={16} />
        </button>
        {showStats && <Stats />}
      </div>
    </Card>
  )
}
