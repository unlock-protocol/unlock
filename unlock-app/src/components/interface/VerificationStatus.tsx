import React, { useState } from 'react'
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
    keyGranter
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
    if (typeof onVerified === 'function') {
      onVerified()
    }
  }

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
