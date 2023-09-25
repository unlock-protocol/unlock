import { Button, Detail, Card } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { VscGraphLine as GraphIcon } from 'react-icons/vsc'
import { useLockManager } from '~/hooks/useLockManager'
import { WithdrawFundModal } from './WithdrawFundModal'

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

  const getLock = async () => {
    return await web3Service.getLock(lockAddress, network)
  }

  const [
    { isLoading, data: lock, refetch },
    { isLoading: isLoadingTotalMembers, data: numberOfOwners },
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
    ],
  })

  const { balance = 0, outstandingKeys: keySold = 0 } = lock ?? {}

  const loading = isLoading || isLoadingTotalMembers

  const withdrawDisabled = parseFloat(`${balance}`) === 0 || loading

  const formattedBalance = parseFloat(`${balance || 0}`)?.toFixed(3)
  const symbol = lock?.currencySymbol || baseCurrencySymbol

  const wrapperClass =
    'pt-4 pb-4 md:pb-0 first-of-type:pt-0 md:py-0 md:pl-4 grow shrink-0 basis-0'

  const Stats = () => {
    return (
      <>
        <div className="grid w-full grid-cols-1 divide-y md:gap-0 md:grid-cols-3 md:divide-y-0 md:divide-x divide-x-gray-500">
          <div className={wrapperClass}>
            <Detail label="Total members" loading={loading} valueSize="large">
              {numberOfOwners}
            </Detail>
          </div>
          <div className={wrapperClass}>
            <Detail label="Key Sold" loading={loading} valueSize="large">
              {keySold}
            </Detail>
          </div>
          <div className={wrapperClass}>
            <Detail
              label={
                <div className="flex items-start gap-4">
                  <span>Balance</span>
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
              }
              valueSize="large"
              loading={loading}
            >
              <div className="flex items-center gap-2">
                <CryptoIcon symbol={symbol} size={36} />
                <span>{formattedBalance}</span>
              </div>
            </Detail>
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
