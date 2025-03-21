import React, { useState } from 'react'
import { ToastHelper } from '@unlock-protocol/ui'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useProvider } from '~/hooks/useProvider'

interface ExpireAndRefundProps {
  isOpen: boolean
  lockAddress: string
  keyOwner: string
  tokenId: string
  setIsOpen: (open: boolean) => void
  network: number
}

export const ExpireAndRefundModal: React.FC<ExpireAndRefundProps> = ({
  isOpen,
  lockAddress,
  keyOwner,
  tokenId,
  setIsOpen,
  network,
}) => {
  const { getWalletService } = useProvider()
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
      const walletService = await getWalletService(network)
      await walletService.expireAndRefundFor({
        lockAddress,
        keyOwner,
        tokenId,
        amount,
      })
      onCloseCallback()
      ToastHelper.success('Key successfully refunded.')
    } catch (err: any) {
      onCloseCallback()
      if (err?.code === 'ACTION_REJECTED') {
        ToastHelper.error('You have rejected the transaction. ')
      } else {
        ToastHelper.error(
          err?.error?.message ??
            err?.message ??
            'There was an error in refund process. Please try again.'
        )
      }
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
          onClick={onExpireAndRefund}
          disabled={loading}
          loading={loading}
        >
          Expire and Refund
        </Button>
      </div>
    </Modal>
  )
}
