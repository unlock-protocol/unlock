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
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ config }: Props) => {
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

  const {
    data: membershipData,
    refetch: refetchMembershipData,
    isLoading: isMembershipDataLoading,
  } = useQuery(
    [tokenId, lockAddress, network],
    (): Promise<MembershipData> => {
      return storageService.getKeyMetadataValues({
        lockAddress,
        network,
        keyId: Number(tokenId),
      })
    },
    {
      refetchInterval: false,
    }
  )

  const isAuthenticated = Boolean(viewer || storageService.token)

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
      enabled: isAuthenticated,
      refetchInterval: false,
    }
  )

  const onCheckIn = async () => {
    try {
      setIsCheckingIn(true)
      const response = await storageService.markTicketAsCheckedIn({
        lockAddress,
        keyId: tokenId,
        network,
      })
      if (!response.ok) {
        throw new Error('Could not check in membership')
      }
      await refetchMembershipData()
      setIsCheckingIn(false)
    } catch (error) {
      ToastHelper.error('Failed to check in')
    }
  }

  if (
    isLockLoading ||
    isMembershipDataLoading ||
    isVerifierLoading ||
    isKeyGranterLoading
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
    membershipData: membershipData!,
    isSignatureValid,
    verificationData: data,
  })

  const checkedInAt = membershipData?.metadata?.checkedInAt

  const CardActions = () => (
    <div className="grid w-full">
      {viewer ? (
        <Button
          loading={isCheckingIn}
          disabled={!isVerifier || isCheckingIn || !!invalid || !!checkedInAt}
          onClick={async (event) => {
            event.preventDefault()
            onCheckIn()
          }}
        >
          {isCheckingIn
            ? 'Checking in'
            : checkedInAt
            ? 'Checked in'
            : 'Check in'}
        </Button>
      ) : (
        <Button
          onClick={(event) => {
            event.preventDefault()
            router.push(
              `/login?redirect=${encodeURIComponent(window.location.href)}`
            )
          }}
        >
          Connect Account
        </Button>
      )}
    </div>
  )

  return (
    <div className="flex justify-center">
      <MembershipCard
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
