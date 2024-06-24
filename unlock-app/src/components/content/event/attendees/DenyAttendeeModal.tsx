import React, { useState } from 'react'
import { Button, Modal } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from '~/config/locksmith'

interface ApproveAttendeeModalProps {
  isOpen: boolean
  lockAddress: string
  attendees: Array<{
    keyholderAddress: string
    email: string
  }>
  setIsOpen: (open: boolean) => void
  network: number
}

export const DenyAttendeeModal: React.FC<ApproveAttendeeModalProps> = ({
  isOpen,
  lockAddress,
  attendees,
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
      await locksmith.denyAttendeesRsvp(network, lockAddress, {
        recipients: attendees.map((a) => a.keyholderAddress),
      })
      setLoading(false)
      ToastHelper.success('The attendee was denied. ')
      onCloseCallback()
    } catch (err: any) {
      console.error(err)
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={onCloseCallback}>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Are you sure?</h1>
        <p>
          The user(s) will <em>not</em> receive an email and you can still
          approve them later if needed.
        </p>

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
