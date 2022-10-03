import { Button } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useMutation, useQueries } from 'react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useConfig } from '~/utils/withConfig'
import { useWalletService } from '~/utils/withWalletService'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CryptoIcon } from '../../elements/KeyPrice'
import { VscGraphLine as GraphIcon } from 'react-icons/vsc'

interface Action {
  title: string
  onClick?: () => void
  disabled?: boolean
}

interface TotalsProps {
  lockAddress: string
  network: number
}
interface TotalProps {
  title: string
  value: string | number | undefined
  loading?: boolean
  prepend?: React.ReactNode
  description?: string
  action?: Action
}

const ValuePlaceholder = () => {
  return <div className="w-24 h-10 bg-slate-200 animate-pulse"></div>
}

const Total = ({
  title,
  value,
  action,
  description,
  prepend,
  loading,
}: TotalProps) => {
  const onAction = () => {
    if (typeof action?.onClick === 'function') {
      action?.onClick()
    }
  }

  const actionDisabled =
    action?.disabled || typeof action?.onClick !== 'function'

  return (
    <div className="flex flex-col gap-3 pt-4 first-of-type:pt-0 md:py-0 md:pl-4 grow shrink-0 basis-0">
      <div className="flex items-start gap-4">
        <span className="text-base text-gray-700">{title}</span>
        {action && (
          <Button
            variant="outlined-primary"
            size="tiny"
            onClick={onAction}
            disabled={actionDisabled}
          >
            <div className="flex gap-1 flex-items-center">
              <span>{action.title}</span>
            </div>
          </Button>
        )}
      </div>

      {loading ? (
        <ValuePlaceholder />
      ) : (
        <div className="flex items-center gap-2">
          {prepend}
          <>
            <span className="text-2xl font-bold md:text-4xl">{value || 0}</span>
            {description && (
              <span className="block text-xs text-gray-700">{description}</span>
            )}
          </>
        </div>
      )}
    </div>
  )
}

export const TotalBar = ({ lockAddress, network }: TotalsProps) => {
  const [showStats, setShowStats] = useState(false)
  const web3Service = useWeb3Service()
  const walletService = useWalletService()
  const { networks } = useConfig()

  const { baseCurrencySymbol } = networks[network] ?? {}

  const getNumberOfOwners = async () => {
    return await web3Service.numberOfOwners(lockAddress, network)
  }

  const getLock = async () => {
    return await web3Service.getLock(lockAddress, network)
  }

  const withdrawFromLockPromise = async (): Promise<unknown> => {
    return await walletService.withdrawFromLock({
      lockAddress,
    })
  }

  const withdrawMutation = useMutation(withdrawFromLockPromise)

  const [
    { isLoading, data: lock },
    { isLoading: isLoadingTotalMembers, data: numberOfOwners },
  ] = useQueries([
    {
      queryKey: ['getLock', lockAddress, network, withdrawMutation.isSuccess],
      queryFn: getLock,
    },
    {
      queryKey: [
        'totalMembers',
        lockAddress,
        network,
        withdrawMutation.isSuccess,
      ],
      queryFn: getNumberOfOwners,
    },
  ])

  const { balance = 0, outstandingKeys: keySold = 0 } = lock ?? {}

  const onWithDraw = async () => {
    const promise = withdrawMutation.mutateAsync(balance)
    await ToastHelper.promise(promise, {
      success: 'Withdraw done',
      error: 'There is some unexpected issue, please try again',
      loading: 'Withdrawing...',
    })
  }

  const loading = isLoading || isLoadingTotalMembers

  const withdrawDisabled =
    parseFloat(`${balance}`) === 0 || loading || withdrawMutation.isLoading

  const formattedBalance = parseFloat(`${balance || 0}`)?.toFixed(3)
  const symbol = lock?.currencySymbol || baseCurrencySymbol

  const Stats = () => {
    return (
      <div className="flex flex-col gap-8 divide-y md:p-8 md:flex-row md:divide-y-0 md:divide-x auto-cols-max divide-x-gray-500">
        <Total title="Total members" value={numberOfOwners} loading={loading} />
        <Total title="Key Sold" value={keySold} loading={loading} />
        <Total
          title="Balance"
          value={formattedBalance}
          loading={loading}
          prepend={<CryptoIcon symbol={symbol} size={36} />}
          action={{
            title: 'Withdraw',
            disabled: withdrawDisabled,
            onClick: onWithDraw,
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col border border-gray-500 rounded-2xl">
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
    </div>
  )
}
