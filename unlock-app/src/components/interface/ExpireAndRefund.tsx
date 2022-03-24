import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { WalletServiceContext } from '../../utils/withWalletService'
import Loading from './Loading'
import useAccount from '../../hooks/useAccount'
import AuthenticationContext from '../../contexts/AuthenticationContext'

interface ExpireAndRefundProps {
  lock: any
  lockAddresses: string[]
  onClose: () => void
}

export const ExpireAndRefund: React.FC<ExpireAndRefundProps> = ({
  lock,
  lockAddresses = [],
  onClose,
}) => {
  const [lockAddress] = lockAddresses
  const { network, account } = useContext(AuthenticationContext) as any
  const { getTokenBalance } = useAccount(lockAddress, network)
  const walletService = useContext(WalletServiceContext)

  const [refundAmount, setRefundAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [canAfford, setCanAfford] = useState(true)

  const getBalance = async () => {
    const balance = await getTokenBalance(lock.currencyContractAddress)
    setBalance(balance)
  }

  useEffect(() => {
    getBalance()
  }, [])

  useEffect(() => {
    if (balance === null) return
    setCanAfford(refundAmount < balance)
  }, [refundAmount, balance])

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onCloseCallback = () => {
    if (typeof onClose === 'function') onClose()
    setLoading(false)
  }

  const onExpireAndRefund = async () => {
    const { keyholderAddress: keyOwner } = lock ?? {}
    const amount = `${refundAmount}`
    setLoading(true)

    const params = {
      lockAddress,
      keyOwner,
      amount,
    }

    try {
      await walletService.expireAndRefundFor(params)
      onCloseCallback()
      toast.success('Key successfully refunded.')
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
      }}
    >
      <small>Set the amount you want to refund</small>
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
        disabled={loading || !canAfford}
      >
        {loading ? (
          <Loading size={20} />
        ) : (
          <span className="ml-2">Expire and Refund</span>
        )}
      </button>
      {!canAfford && (
        <small className="text-sm text-red-600 mt-2">
          Balance can&apos;t cover the refund
        </small>
      )}
    </div>
  )
}
