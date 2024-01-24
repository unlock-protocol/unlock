import React, { useState } from 'react'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface ApproveAttendeeModalProps {
  isOpen: boolean
  lockAddress: string
  keyOwner: string
  setIsOpen: (open: boolean) => void
  network: number
}

export const ApproveAttendeeModalModal: React.FC<ApproveAttendeeModalProps> = ({
  isOpen,
  lockAddress,
  keyOwner,
  setIsOpen,
  network,
}) => {
  const { getWalletService } = useAuth()
  const [refundAmount, setRefundAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onCloseCallback = () => {
    setIsOpen(false)
    setLoading(false)
  }

  const onApproveAttendeeModal = async () => {
    const amount = `${refundAmount}`
    setLoading(true)

    try {
      const walletService = await getWalletService(network)
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
          step="any"
          value={refundAmount}
          onChange={onAmountChange}
          min={0}
          disabled={loading}
        />
        <Button
          type="button"
          onClick={onApproveAttendeeModal}
          disabled={loading}
          loading={loading}
        >
          Expire and Refund
        </Button>
      </div>
    </Modal>
  )
}
