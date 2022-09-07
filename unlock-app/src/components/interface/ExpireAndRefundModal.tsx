import React, { useState } from 'react'
import { useWalletService } from '~/utils/withWalletService'
import Loading from './Loading'
import InlineModal from './InlineModal'
import { ToastHelper } from '../helpers/toast.helper'

interface ExpireAndRefundProps {
  active: boolean
  lockAddress: string
  keyOwner: string
  tokenId: string
  dismiss: () => void
}

export const ExpireAndRefundModal: React.FC<ExpireAndRefundProps> = ({
  active,
  lockAddress,
  keyOwner,
  tokenId,
  dismiss,
}) => {
  const walletService = useWalletService()

  const [refundAmount, setRefundAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onCloseCallback = () => {
    if (typeof dismiss === 'function') {
      dismiss()
    }
    setLoading(false)
  }

  const onExpireAndRefund = async () => {
    const amount = `${refundAmount}`
    setLoading(true)

    try {
      await walletService.expireAndRefundFor({
        lockAddress,
        keyOwner,
        tokenId,
        amount,
      })
      onCloseCallback()
      ToastHelper.success('Key successfully refunded.')
      // reload page to show updated list of keys
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      onCloseCallback()
      ToastHelper.error(
        err?.error?.message ??
          err?.message ??
          'There was an error in refund process. Please try again.'
      )
    }
  }

  return (
    <InlineModal active={active} dismiss={onCloseCallback}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <p className="text-sm">Set the amount you want to refund</p>
        <input
          className="text-right my-2"
          type="number"
          step="0.01"
          value={refundAmount}
          onChange={onAmountChange}
          min={0}
          disabled={loading}
        />
        <button
          className="bg-gray-200 rounded px-2 py-1 text-sm mt-4 flex justify-center disabled:opacity-50"
          type="button"
          onClick={onExpireAndRefund}
          disabled={loading}
        >
          {loading ? (
            <Loading size={20} />
          ) : (
            <span className="ml-2">Expire and Refund</span>
          )}
        </button>
      </div>
    </InlineModal>
  )
}
