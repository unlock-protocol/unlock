import React, { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { WalletServiceContext } from '../../../utils/withWalletService'
import Loading from '../Loading'

export interface ICancelAndRefundProps {
  lock: any
  onClose: () => void
  account: string
}

export const CancelAndRefund: React.FC<ICancelAndRefundProps> = ({
  lock,
  onClose,
  account: owner,
}) => {
  const [loading, setLoading] = useState(false)
  const [loadingAmount, setLoadingAmount] = useState(false)
  const [refundAmount, setRefundAmount] = useState<number | null>(null)
  const walletService = useContext(WalletServiceContext)
  const { address: lockAddress, tokenAddress } = lock ?? {}

  useEffect(() => {
    getRefundAmount()
  }, [])

  const getRefundAmount = async () => {
    setLoadingAmount(true)
    const params = {
      lockAddress,
      owner,
      tokenAddress,
    }
    const totalToRefund = await walletService.getCancelAndRefundValueFor(params)
    setRefundAmount(totalToRefund)
    setLoadingAmount(false)
  }

  const onCloseCallback = () => {
    if (typeof onClose === 'function') onClose()
    setLoading(false)
  }

  const onCancelAndRefund = async () => {
    setLoading(true)

    const params = {
      lockAddress,
    }

    try {
      await walletService.cancelAndRefund(params)
      onCloseCallback()
      toast.success('Key cancelled and successfully refunded.')
      // reload page to show updated list of keys
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      onCloseCallback()
      toast.error(
        err?.error?.message ??
          err?.message ??
          'There was an error in refund process. Please try again.'
      )
    }
  }

  if (!lock) return <span>No lock selected</span>
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {loadingAmount ? (
        <Loading />
      ) : (
        <>
          <h3 className="text-black-500">Cancel and Refund</h3>
          <small className="pt-2">
            {`${refundAmount} will be refunded, Do you want to proceed?`}
          </small>
        </>
      )}
      <button
        className="bg-gray-200 rounded px-2 py-1 text-sm mt-4 flex justify-center disabled:opacity-50 w-100"
        type="button"
        onClick={onCancelAndRefund}
        disabled={loading || loadingAmount}
      >
        {loading ? (
          <Loading size={20} />
        ) : (
          <span className="ml-2">Confirm</span>
        )}
      </button>
    </div>
  )
}
