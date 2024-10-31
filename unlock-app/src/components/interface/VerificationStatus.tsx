import { useState } from 'react'
import {
  MembershipCard,
  MembershipCardPlaceholder,
} from './verification/MembershipCard'
import { ToastHelper } from '../helpers/toast.helper'
import { MembershipVerificationConfig } from '~/utils/verification'
import { invalidMembership } from './verification/invalidMembership'
import { Button, Modal } from '@unlock-protocol/ui'
import { isSignatureValidForAddress } from '~/utils/signatures'
import { locksmith } from '~/config/locksmith'
import { AxiosError } from 'axios'
import { useEventTicket, useLocksmithGranterAddress } from '~/hooks/useTicket'
import { MAX_UINT } from '~/constants'
import { config as AppConfig } from '~/config/app'
import { useConnectModal } from '~/hooks/useConnectModal'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutConfig?: PaywallConfigType
  eventProp?: Event
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
  <Modal isOpen={isOpen} setIsOpen={setIsOpen} size="small">
    <div className="w-full max-w-sm bg-white rounded-xl">
      <div className="flex flex-col gap-3">
        <div className="p-2 text-center bg-amber-300 rounded-t-xl">
          <span className="text-lg">Warning</span>
        </div>
        <div className="flex flex-col w-full gap-3 p-4">
          <span>
            The current ticket has not been checked-in. Are you sure you want to
            scan the next one?
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
  </Modal>
)

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({
  checkoutConfig,
  eventProp,
  config,
  onVerified,
}: Props) => {
  const { data, sig, raw } = config
  const { lockAddress, timestamp, network, tokenId, account } = data
  const { account: viewer } = useAuthenticate()
  const { openConnectModal } = useConnectModal()
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const { isLoading: isKeyGranterLoading, data: keyGranter } =
    useLocksmithGranterAddress()

  const {
    isLoading: isTicketLoading,
    data: ticket,
    refetch: refetchTicket,
  } = useEventTicket({
    lockAddress,
    keyId: tokenId!,
    network,
    eventProp,
  })

  const onCheckIn = async () => {
    try {
      setIsCheckingIn(true)
      if (eventProp) {
        await locksmith.checkEventTicket(
          eventProp.slug,
          network,
          lockAddress,
          tokenId!
        )
      } else {
        await locksmith.checkTicket(network, lockAddress, tokenId!)
      }
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

  const isSignatureValid = !!(
    ticket &&
    isSignatureValidForAddress(
      sig,
      raw,
      account,
      [...AppConfig.locksmithSigners, ticket!.owner, keyGranter!].filter(
        (item) => !!item
      )
    )
  )

  const invalid = ticket
    ? invalidMembership({
        locks: checkoutConfig ? checkoutConfig?.locks : null,
        network,
        manager: ticket!.manager,
        keyId: ticket!.keyId,
        owner: ticket!.owner,
        expiration:
          ticket!.expiration === MAX_UINT ? -1 : parseInt(ticket!.expiration),
        isSignatureValid,
        verificationData: data,
      })
    : 'Invalid QR code'

  const isTicketVerifiable =
    Object.keys(checkoutConfig?.locks ?? {}).some(
      (address) => address.toLowerCase() === ticket!.lockAddress.toLowerCase()
    ) || !checkoutConfig

  const checkedInAt = ticket?.checkedInAt

  const disableActions = !ticket?.isVerifier || isCheckingIn || !!invalid

  const onClickVerified = () => {
    if (
      !checkedInAt &&
      ticket!.isVerifier &&
      !showWarning &&
      isTicketVerifiable
    ) {
      setShowWarning(true)
    } else if (typeof onVerified === 'function') {
      onVerified()
    }
  }

  const CardActions = () => (
    <div className="grid w-full gap-2">
      {viewer ? (
        isTicketVerifiable && ticket!.isVerifier ? (
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
      {ticket && (
        <MembershipCard
          image={ticket!.image}
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
      )}
      {!ticket && (
        <div className="flex flex-col center">
          <p className="p-8 text-red-500 items-center text-center">
            Invalid QR Code.
          </p>
          <Button variant="outlined-primary" onClick={onVerified}>
            Scan next ticket
          </Button>
        </div>
      )}
    </div>
  )
}

export default VerificationStatus
