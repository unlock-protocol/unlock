import React, { useState } from 'react'
import { Button, Detail, Modal } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata } from '@unlock-protocol/core'
import { MAX_UINT } from '~/constants'
import { storage } from '~/config/storage'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface ApproveAttendeeModalProps {
  isOpen: boolean
  lockAddress: string
  keyOwner: string
  setIsOpen: (open: boolean) => void
  network: number
  metadata: Metadata
}

export const ApproveAttendeeModalModal: React.FC<ApproveAttendeeModalProps> = ({
  isOpen,
  lockAddress,
  keyOwner,
  setIsOpen,
  network,
  metadata,
}) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()
  const [loading, setLoading] = useState(false)

  const onCloseCallback = () => {
    setIsOpen(false)
    setLoading(false)
  }

  const onConfirm = async () => {
    setLoading(true)

    try {
      // Airdrop + call API!
      const walletService = await getWalletService(network)

      const alreadyHasTicket = await web3Service.getHasValidKey(
        lockAddress,
        keyOwner,
        network
      )
      if (!alreadyHasTicket) {
        // Grant keys
        await walletService
          .grantKeys(
            {
              recipients: [keyOwner],
              expirations: [MAX_UINT],
              lockAddress,
            },
            {},
            async (error, hash: string | null) => {
              if (error) {
                throw error
              }
              if (hash) {
                await storage.approveRsvp(network, lockAddress, keyOwner)
              }
            }
          )
          .catch((error: any) => {
            console.error(error)
            throw new Error('We were unable to airdrop this ticket.')
          })
      } else {
        await storage.approveRsvp(network, lockAddress, keyOwner)
      }

      ToastHelper.success(
        `The ticket for ${metadata.email} was successfuly airdropped!`
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
          Please confirm you are ready to airdrop an NFT ticket to this user.
        </p>

        {Object.keys(metadata)
          .filter(
            (value) =>
              [
                'keyholderAddress',
                'keyManager',
                'approval',
                'lockAddress',
              ].indexOf(value) === -1
          )
          .map((key) => {
            return (
              <Detail key={key} label={key}>
                {metadata[key]}
              </Detail>
            )
          })}

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
