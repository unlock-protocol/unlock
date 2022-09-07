import React, { Fragment, useState } from 'react'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useWeb3Service } from '../../utils/withWeb3Service'
import { useQuery } from 'react-query'
import { Lock } from '~/unlockTypes'
import {
  MembershipCard,
  MembershipCardPlaceholder,
  MembershipData,
} from './verification/MembershipCard'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '../helpers/toast.helper'
import { MembershipVerificationConfig } from '~/utils/verification'
import { invalidMembership } from './verification/invalidMembership'
import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import { isSignatureValidForAddress } from '~/utils/signatures'
import { useConfig } from '~/utils/withConfig'
import { Dialog, Transition } from '@headlessui/react'
import { FaSpinner as Spinner } from 'react-icons/fa'

interface Props {
  config: MembershipVerificationConfig
  onVerified: () => void
  onClose?: () => void
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ config, onVerified, onClose }: Props) => {
  const { data, sig, raw } = config
  const { lockAddress, timestamp, network, tokenId, account } = data
  const { account: viewer } = useAuth()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()
  const router = useRouter()
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const { locksmithSigners } = useConfig()
  const [showWarning, setShowWarning] = useState(false)

  const { isLoading: isKeyGranterLoading, data: keyGranter } = useQuery(
    [network],
    () => {
      return storageService.getKeyGranter(network)
    },
    {
      refetchInterval: false,
    }
  )

  const { isLoading: isLockLoading, data: lock } = useQuery(
    [lockAddress, network],
    async () => {
      const result: Lock = await web3Service.getLock(lockAddress, network)
      return result
    },
    {
      refetchInterval: false,
    }
  )

  const lockVersion = lock?.publicLockVersion

  const { isLoading: isKeyLoading, data: key } = useQuery(
    [network, tokenId, lockAddress],
    async () => {
      // Some older QR codes might have been generated without a tokenId in the payload. Clean up after January 2023
      if (lockVersion && lockVersion >= 10 && tokenId) {
        return web3Service.getKeyByTokenId(lockAddress, tokenId, network)
      } else {
        return web3Service.getKeyByLockForOwner(lockAddress, account, network)
      }
    },
    {
      enabled: !!lockVersion,
    }
  )

  const keyId = key?.tokenId.toString()

  const {
    data: membershipData,
    refetch: refetchMembershipData,
    isLoading: isMembershipDataLoading,
  } = useQuery(
    [keyId, lockAddress, network],
    (): Promise<MembershipData> => {
      return storageService.getKeyMetadataValues({
        lockAddress,
        network,
        keyId: Number(keyId),
      })
    },
    {
      refetchInterval: false,
      enabled: !!key,
    }
  )

  const { data: isVerifier, isLoading: isVerifierLoading } = useQuery(
    [viewer, network, lockAddress],
    () => {
      return storageService.getVerifierStatus({
        viewer: viewer!,
        network,
        lockAddress,
      })
    },
    {
      enabled: storageService.isAuthenticated,
      refetchInterval: false,
    }
  )

  const onCheckIn = async () => {
    try {
      setIsCheckingIn(true)
      const response = await storageService.markTicketAsCheckedIn({
        lockAddress,
        keyId: keyId!,
        network,
      })
      if (!response.ok) {
        if (response.status === 409) {
          ToastHelper.error('Ticket already checked in')
        } else {
          throw new Error('Failed to check in')
        }
      }
      await refetchMembershipData()
      setIsCheckingIn(false)
      setShowWarning(false)
    } catch (error) {
      console.error(error)
      ToastHelper.error('Failed to check in')
    }
  }

  if (
    isLockLoading ||
    isMembershipDataLoading ||
    isVerifierLoading ||
    isKeyGranterLoading ||
    isKeyLoading
  ) {
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
    (locksmithSigners || []).concat(keyGranter)
  )

  const invalid = invalidMembership({
    keyId: keyId!,
    owner: key!.owner,
    expiration: key!.expiration,
    isSignatureValid,
    verificationData: data,
  })

  const checkedInAt = membershipData?.metadata?.checkedInAt

  const disableActions =
    !isVerifier || isCheckingIn || !!invalid || !!checkedInAt

  const onClickVerified = () => {
    const promptWarning = viewer && !checkedInAt && isVerifier && !showWarning
    if (promptWarning) {
      setShowWarning(true)
    } else if (typeof onVerified === 'function') {
      onVerified()
    }
  }

  const WarningDialog = () => (
    <Transition show appear as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          setShowWarning(false)
        }}
        open
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
                    <div className="p-2 bg-amber-300 rounded-t-xl">
                      <span className="text-lg text-center">Warning</span>
                    </div>
                    <div className="flex flex-col w-full gap-3 p-4">
                      <span>
                        {`The current ticket ticket is not marked as "checked in"`}
                      </span>
                      <Button
                        onClick={() => setShowWarning(false)}
                        disabled={isCheckingIn}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outlined-primary"
                        onClick={onCheckIn}
                        disabled={isCheckingIn}
                      >
                        <div className="flex items-center">
                          {isCheckingIn && (
                            <Spinner className="mr-1 animate-spin" />
                          )}
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

  const CardActions = () => (
    <div className="grid w-full gap-2">
      {viewer ? (
        !checkedInAt && !!isVerifier ? (
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
            router.push(
              `/login?redirect=${encodeURIComponent(window.location.href)}`
            )
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
      {showWarning && <WarningDialog />}
      <MembershipCard
        onClose={onClose}
        keyId={keyId!}
        owner={key!.owner}
        membershipData={membershipData!}
        invalid={invalid}
        timestamp={timestamp}
        lock={lock!}
        network={network}
        checkedInAt={checkedInAt}
      >
        <CardActions />
      </MembershipCard>
    </div>
  )
}

export default VerificationStatus
