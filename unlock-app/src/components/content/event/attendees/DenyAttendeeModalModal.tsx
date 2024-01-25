import React, { useState } from 'react'
import { Button, Modal } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { storage } from '~/config/storage'

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
    try {
      setLoading(true)
      await storage.denyRsvp(network, lockAddress, keyOwner)
      setLoading(false)
      ToastHelper.success(
        'The attendee was successfuly denied. You can still approve them later if needed.'
      )
      onCloseCallback()
    } catch (err: any) {
      console.error(err)
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={onCloseCallback}>
      <div className="flex flex-col gap-3">
        <p className="text-lg">Are you sure?</p>
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
