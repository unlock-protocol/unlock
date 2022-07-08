import React from 'react'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useWeb3Service } from '../../utils/withWeb3Service'
import { useQuery } from 'react-query'
import { Lock } from '~/unlockTypes'
import { KeyCard, Membership } from './verification/KeyCard'
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
  const { account, lockAddress, timestamp, network, tokenId } = data
  const { account: viewer } = useAuth()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()
  const router = useRouter()
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

  const { isLoading: isMembershipLoading, data: membership } = useQuery(
    [lockAddress, network, tokenId],
    async () => {
      if (lock?.publicLockVersion && lock.publicLockVersion >= 10) {
        return web3Service.getKeyByTokenId(
          lockAddress,
          tokenId,
          network
        ) as Promise<Membership>
      } else {
        return web3Service.getKeyByLockForOwner(
          lockAddress,
          account,
          network
        ) as unknown as Promise<Membership>
      }
    },
    {
      refetchInterval: false,
      enabled: !!lock,
    }
  )

  const { data: keyData, isLoading: isKeyDataLoading } = useQuery(
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

  if (
    isMembershipLoading ||
    isLockLoading ||
    isKeyDataLoading ||
    isVerifierLoading
  ) {
    return (
      <div className="flex h-72 justify-center items-center">
        <LoadingIcon size={24} className="animate-spin" />
      </div>
    )
  }

  const invalid = invalidMembershipReason({
    membership: membership!,
    data,
    rawData,
    sig,
  })

  const checkedInAt = keyData?.metadata?.checkedInAt

  return (
    <div className="flex justify-center">
      <KeyCard
        keyData={keyData}
        invalid={invalid}
        timestamp={timestamp}
        membership={membership!}
        lock={lock!}
        network={network}
        checkedInAt={checkedInAt}
      >
        <div className="grid w-full">
          {viewer ? (
            <Button
              disabled={!isVerifier || !!invalid || checkedInAt}
              onClick={(event) => {
                event.preventDefault()
                onCheckIn()
              }}
            >
              {checkedInAt ? 'Already checked in' : 'Check in'}
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
      </KeyCard>
    </div>
  )
}

export default VerificationStatus
