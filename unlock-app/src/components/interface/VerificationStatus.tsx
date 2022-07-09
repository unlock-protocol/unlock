import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useWeb3Service } from '../../utils/withWeb3Service'
import { useQuery } from 'react-query'
import { Lock } from '~/unlockTypes'
import { MembershipCard } from './verification/MembershipCard'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '../helpers/toast.helper'
import * as z from 'zod'
import { MembershipVerificationData } from '~/utils/verification'
import { invalidMembershipReason } from './verification/invalidMembershipReason'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'
import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'

interface Props {
  data: z.infer<typeof MembershipVerificationData>
  rawData: string
  sig: string
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ data, sig, rawData }: Props) => {
  const { lockAddress, timestamp, network, tokenId } = data
  const { account: viewer } = useAuth()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()
  const router = useRouter()
  const [isCheckingIn, setIsCheckingIn] = useState(false)
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
    () => {
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
      enabled: Boolean(viewer && storageService.token),
      refetchInterval: false,
    }
  )

  const onCheckIn = async () => {
    try {
      const response = await storageService.markTicketAsCheckedIn({
        lockAddress,
        keyId: tokenId,
        network,
      })
      if (!response.ok) {
        throw new Error('Could not check in membership')
      }
    } catch (error) {
      ToastHelper.error('Failed to check in')
    }
  }

  if (isLockLoading || isMembershipDataLoading || isVerifierLoading) {
    return (
      <div className="flex h-72 justify-center items-center">
        <LoadingIcon size={24} className="animate-spin" />
      </div>
    )
  }

  const invalid = invalidMembershipReason({
    membershipData,
    data,
    rawData,
    sig,
  })

  const checkedInAt = membershipData?.metadata?.checkedInAt

  return (
    <div className="flex justify-center">
      <MembershipCard
        membershipData={membershipData}
        invalid={invalid}
        timestamp={timestamp}
        lock={lock!}
        network={network}
        checkedInAt={checkedInAt}
      >
        <div className="grid w-full">
          {viewer ? (
            <Button
              loading={isCheckingIn}
              disabled={!isVerifier || isCheckingIn || !!invalid || checkedInAt}
              onClick={async (event) => {
                event.preventDefault()
                setIsCheckingIn(true)
                await onCheckIn()
                await refetchMembershipData()
                setIsCheckingIn(false)
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
                router.push('/login?redirect=verification')
              }}
            >
              Connect Account
            </Button>
          )}
        </div>
      </MembershipCard>
    </div>
  )
}

export default VerificationStatus
