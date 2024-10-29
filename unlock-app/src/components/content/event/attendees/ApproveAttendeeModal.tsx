import React, { useState } from 'react'
import { Button, Modal } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { MAX_UINT } from '~/constants'
import { locksmith } from '~/config/locksmith'
import { useProvider } from '~/hooks/useProvider'

interface ApproveAttendeeModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  network: number
  lockAddress: string
  attendees: Array<{
    keyholderAddress: string
    email: string
  }>
}

export const ApproveAttendeeModal: React.FC<ApproveAttendeeModalProps> = ({
  isOpen,
  setIsOpen,
  network,
  lockAddress,
  attendees,
}) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useProvider()
  const [loading, setLoading] = useState(false)
  const onCloseCallback = () => {
    setIsOpen(false)
    setLoading(false)
  }

  const onConfirm = async () => {
    setLoading(true)

    try {
      const walletService = await getWalletService(network)
      const airdropRecipients = []
      for (let i = 0; i < attendees.length; i++) {
        const keyOwner = attendees[i].keyholderAddress
        const alreadyHasTicket = await web3Service.getHasValidKey(
          lockAddress,
          keyOwner,
          network
        )
        if (!alreadyHasTicket) {
          airdropRecipients.push(keyOwner)
        }
      }
      // Mark all as approved!
      if (airdropRecipients.length === 0) {
        await locksmith.approveAttendeesRsvp(network, lockAddress, {
          recipients: attendees.map((a) => a.keyholderAddress),
        })
      }
      await walletService
        .grantKeys(
          {
            recipients: airdropRecipients,
            expirations: airdropRecipients.map(() => MAX_UINT),
            lockAddress,
          },
          {},
          async (error, hash: string | null) => {
            if (error) {
              throw error
            }
            if (hash) {
              await locksmith.approveAttendeesRsvp(network, lockAddress, {
                recipients: attendees.map((a) => a.keyholderAddress),
              })
            }
          }
        )
        .catch((error: any) => {
          console.error(error)
          throw new Error('We were unable to airdrop this ticket.')
        })

      ToastHelper.success(
        `You have successfully approved and airdropped ${airdropRecipients.length} ticket(s) to the selected user(s).`
      )
      onCloseCallback()
    } catch (err: any) {
      onCloseCallback()
      ToastHelper.error(
        err?.error?.message ??
          err?.message ??
          'There was an error when airdropping a ticket to this user. Please try again.'
      )
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={onCloseCallback}>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Are you sure? </h1>
        <p className="text-lg">
          Please confirm you are ready to airdrop an NFT ticket to the following
          user(s):
        </p>
        <ul>
          {attendees.map((key) => {
            return (
              <li key={key.keyholderAddress}>
                <p>
                  <strong>{key.email}</strong>
                </p>
              </li>
            )
          })}
        </ul>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          loading={loading}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
