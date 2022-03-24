import React, { useState } from 'react'
import { WalletService } from '@unlock-protocol/unlock-js'
import Loading from './Loading'

interface ExpireAndRefundProps {}

export const ExpireAndRefund: React.FC<ExpireAndRefundProps> = () => {
  const [refundAmount, setRefundAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onExpireAndRefund = async () => {
    setLoading(true)
    // @ts-ignore
    await WalletService.expireAndRefundFor({})
    setLoading(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          <small>Set the amount you want to refund</small>
          <input
            className="text-right my-2"
            type="number"
            step="0.01"
            value={refundAmount}
            onChange={onAmountChange}
            min={0}
          />
        </>
      )}
      <button
        className="bg-gray-200 rounded px-2 py-1 text-sm mt-4"
        type="button"
        onClick={onExpireAndRefund}
        disabled={loading}
      >
        {loading ? 'Performing refund...' : 'Expire and Refund'}
      </button>
    </div>
  )
}
