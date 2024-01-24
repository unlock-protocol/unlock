import React, { useState } from 'react'
import { Button, Modal } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface ApproveAttendeeModalProps {
  isOpen: boolean
  lockAddress: string
  keyOwner: string
  setIsOpen: (open: boolean) => void
  network: number
}

export const DenyAttendeeModalModal: React.FC<ApproveAttendeeModalProps> = ({
  isOpen,
  lockAddress,
  keyOwner,
  setIsOpen,
  network,
}) => {
  const [loading, setLoading] = useState(false)

  const onCloseCallback = () => {
    setIsOpen(false)
    setLoading(false)
  }

  const confirm = async () => {
    setLoading(true)

    try {
      onCloseCallback()
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
        <p className="text-sm">Are you sure?</p>
        <Button
          type="button"
          onClick={confirm}
          disabled={loading}
          loading={loading}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
