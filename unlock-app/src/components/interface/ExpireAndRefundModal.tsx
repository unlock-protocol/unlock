import React, { useState } from 'react'
import { useWalletService } from '~/utils/withWalletService'
import Loading from './Loading'
import { ToastHelper } from '../helpers/toast.helper'
import { Button, Input, Modal } from '@unlock-protocol/ui'

interface ExpireAndRefundProps {
  isOpen: boolean
  lockAddress: string
  keyOwner: string
  tokenId: string
  setIsOpen: (open: boolean) => void
}

export const ExpireAndRefundModal: React.FC<ExpireAndRefundProps> = ({
  isOpen,
  lockAddress,
  keyOwner,
  tokenId,
  setIsOpen,
}) => {
  const walletService = useWalletService()

  const [refundAmount, setRefundAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onCloseCallback = () => {
    setIsOpen(false)
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
    <Modal isOpen={isOpen} setIsOpen={onCloseCallback}>
      <div className="flex flex-col gap-3">
        <p className="text-sm">Set the amount you want to refund</p>
        <Input
          className="my-2 text-right"
          type="number"
          step="0.01"
          value={refundAmount}
          onChange={onAmountChange}
          min={0}
          disabled={loading}
        />
        <Button type="button" onClick={onExpireAndRefund} disabled={loading}>
          {loading ? (
            <Loading size={20} />
          ) : (
            <span className="ml-2">Expire and Refund</span>
          )}
        </Button>
      </div>
    </Modal>
  )
}
