import React, { Fragment, useState } from 'react'
import { useAuth } from '../../contexts/AuthenticationContext'
import {
  MembershipCard,
  MembershipCardPlaceholder,
} from './verification/MembershipCard'
import { ToastHelper } from '../helpers/toast.helper'
import { MembershipVerificationConfig } from '~/utils/verification'
import { invalidMembership } from './verification/invalidMembership'
import { Button } from '@unlock-protocol/ui'
import { isSignatureValidForAddress } from '~/utils/signatures'
import { storage } from '~/config/storage'
import { AxiosError } from 'axios'
import { useLocksmithGranterAddress, useTicket } from '~/hooks/useTicket'
import { Dialog, Transition } from '@headlessui/react'
import { MAX_UINT } from '~/constants'
import { config as AppConfig } from '~/config/app'
import { useConnectModal } from '~/hooks/useConnectModal'

interface Props {
  config: MembershipVerificationConfig
  onVerified: () => void
  onClose?: () => void
}

interface WarningDialogProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  onConfirm: () => void
}

const WarningDialog = ({
  isOpen,
  setIsOpen,
  onConfirm,
}: WarningDialogProps) => (
  <Transition show={isOpen} appear as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={() => {
        setIsOpen(false)
      }}
      open={isOpen}
    >
      <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
      <Transition.Child
        as={Fragment}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="fixed inset-0 p-6 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full">
            <Dialog.Panel className="w-full max-w-sm">
              <div className="w-full max-w-sm bg-white rounded-xl">
                <div className="flex flex-col gap-3">
                  <div className="p-2 text-center bg-amber-300 rounded-t-xl">
                    <span className="text-lg">Warning</span>
                  </div>
                  <div className="flex flex-col w-full gap-3 p-4">
                    <span>
                      The current ticket has not been checked-in. Are you sure
                      you want to scan the next one?
                    </span>
                    <Button
                      onClick={(event) => {
                        event.preventDefault()
                        setIsOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outlined-primary"
                      onClick={(event) => {
                        event.preventDefault()
                        onConfirm()
                      }}
                    >
                      <div className="flex items-center">
                        <span>Ok, continue</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Transition.Child>
    </Dialog>
  </Transition>
)

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ config, onVerified, onClose }: Props) => {
  const { data, sig, raw } = config
  const { lockAddress, timestamp, network, tokenId, account } = data
  const { account: viewer } = useAuth()
  const { openConnectModal } = useConnectModal()
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const { isLoading: isKeyGranterLoading, data: keyGranter } =
    useLocksmithGranterAddress()

  const {
    isLoading: isTicketLoading,
    data: ticket,
    refetch: refetchTicket,
  } = useTicket({
    lockAddress,
    keyId: tokenId!,
    network,
  })

  const onCheckIn = async () => {
    try {
      setIsCheckingIn(true)
      await storage.checkTicket(network, lockAddress, tokenId!)
      await refetchTicket()
      setIsCheckingIn(false)
      setShowWarning(false)
    } catch (error) {
      console.error(error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          ToastHelper.error('Ticket already checked in')
          return
        }
      }
      ToastHelper.error('Failed to check in')
    }
  }

  if (isTicketLoading || isKeyGranterLoading) {
    return (
      <div className="flex justify-center">
        <MembershipCardPlaceholder />
      </div>
    )
  }

  const isSignatureValid = isSignatureValidForAddress(
    sig,
    raw,
    account,
    [...AppConfig.locksmithSigners, ticket!.owner, keyGranter!].filter(
      (item) => !!item
    )
  )

  const invalid = invalidMembership({
    network,
    manager: ticket!.manager,
    keyId: ticket!.keyId,
    owner: ticket!.owner,
    expiration:
      ticket!.expiration === MAX_UINT ? -1 : parseInt(ticket!.expiration),
    isSignatureValid,
    verificationData: data,
  })

  const checkedInAt = ticket!.checkedInAt

  const disableActions =
    !ticket!.isVerifier || isCheckingIn || !!invalid || !!checkedInAt

  const onClickVerified = () => {
    if (!checkedInAt && ticket!.isVerifier && !showWarning) {
      setShowWarning(true)
    } else if (typeof onVerified === 'function') {
      onVerified()
    }
  }

  const CardActions = () => (
    <div className="grid w-full gap-2">
      {viewer ? (
        !checkedInAt && ticket!.isVerifier ? (
          <Button
            loading={isCheckingIn}
            disabled={disableActions}
            variant={'primary'}
            onClick={async (event) => {
              event.preventDefault()
              onCheckIn()
            }}
          >
            {isCheckingIn ? 'Checking in' : 'Check in'}
          </Button>
        ) : null
      ) : (
        <Button
          onClick={(event) => {
            event.preventDefault()
            openConnectModal()
          }}
          variant="primary"
        >
          Connect to check-in
        </Button>
      )}
      <Button variant="outlined-primary" onClick={onClickVerified}>
        Scan next ticket
      </Button>
    </div>
  )

  return (
    <div className="flex justify-center">
      <WarningDialog
        isOpen={showWarning}
        setIsOpen={setShowWarning}
        onConfirm={onClickVerified}
      />
      <MembershipCard
        image={ticket!.image}
        onClose={onClose}
        keyId={tokenId!}
        owner={ticket!.owner}
        userMetadata={ticket!.userMetadata}
        invalid={invalid}
        timestamp={timestamp}
        lockAddress={lockAddress}
        name={ticket!.name}
        network={network}
        checkedInAt={checkedInAt}
        showWarning={showWarning}
      >
        <CardActions />
      </MembershipCard>
    </div>
  )
}

export default VerificationStatus
