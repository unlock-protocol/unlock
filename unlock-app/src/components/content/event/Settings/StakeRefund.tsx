import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from '~/config/locksmith'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { Event } from '@unlock-protocol/core'
import { config } from '~/config/app'
import { useLockManager } from '~/hooks/useLockManager'
import { useAddLockManager } from '~/hooks/useAddLockManager'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { useAuth } from '~/contexts/AuthenticationContext'

const KickbackAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'lockAddress', type: 'address' },
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
    ],
    name: 'approveRefunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'issuedRefunds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'lockAddress', type: 'address' },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'refund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'roots',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export interface StakeRefundProps {
  event: Event
  refundsToApprove: any
  lockAddress: string
  network: number
}

export const SetKickbackContractAsLockManager = ({
  event,
  lockAddress,
  network,
}: StakeRefundProps) => {
  const { kickbackAddress } = config.networks[event.attendeeRefund!.network]
  const {
    isManager,
    isLoading: isLoadingLockManager,
    refetch,
  } = useLockManager({
    lockAddress,
    network,
    lockManagerAddress: kickbackAddress,
  })

  const addLockManagerMutation = useAddLockManager(lockAddress, network)

  const onAddLockManager = async () => {
    await addLockManagerMutation.mutateAsync(kickbackAddress!)
    await refetch()
  }

  if (isLoadingLockManager) {
    return (
      <div className="flex flex-col">
        <Placeholder.Root>
          <Placeholder.Line size="sm" />
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      </div>
    )
  }

  if (isManager) {
    return <p>✅ The refund contract is a manager and can issue refunds.</p>
  }

  return (
    <div className="flex flex-col">
      <p>
        ❌ To issue refunds, you will need to let a 3rd party contract withdraw
        from your lock.
      </p>
      <Button
        onClick={onAddLockManager}
        size="small"
        loading={isLoadingLockManager || addLockManagerMutation.isLoading}
      >
        Approve contract as manager
      </Button>
    </div>
  )
}

export const SaveRootForRefunds = ({
  refundsToApprove,
  event,
  lockAddress,
  network,
}: StakeRefundProps) => {
  const { kickbackAddress } = config.networks[event.attendeeRefund!.network]
  const web3Service = useWeb3Service()
  const provider = web3Service.providerForNetwork(network)
  const { getWalletService } = useAuth()

  const {
    data: proof,
    isLoading: isLoadingProof,
    refetch,
  } = useQuery(['getProof', lockAddress], async () => {
    const contract = new ethers.Contract(
      kickbackAddress!,
      KickbackAbi,
      provider
    )

    return contract.roots(lockAddress)
  })

  const setProof = useMutation(async () => {
    const walletService = await getWalletService(network)
    const contract = new ethers.Contract(
      kickbackAddress!,
      KickbackAbi,
      walletService.signer
    )

    await ToastHelper.promise(
      async () => {
        const transaction = await contract.approveRefunds(
          lockAddress,
          refundsToApprove.tree[0]
        )
        await transaction.wait()
        await refetch()
      },
      {
        success: 'Refunds have been approved.',
        error:
          'We could not save your event. Please try again and report if the issue persists.',
        loading: `Updating your event's properties.`,
      }
    )
  })

  const addProof = async () => {
    await setProof.mutateAsync()
  }

  if (isLoadingProof) {
    return (
      <div className="flex flex-col">
        <Placeholder.Root>
          <Placeholder.Line size="sm" />
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      </div>
    )
  }

  if (proof === refundsToApprove.tree[0]) {
    return (
      <div className="flex flex-col">
        <p>✅ The list of attendees approved for refunds has been saved</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <p>
        ❌ And finally you need to save the list of users who are approved for
        refunds.
      </p>
      <Button onClick={addProof} loading={setProof.isLoading} size="small">
        Save approved attendees
      </Button>
    </div>
  )
}

export const StakeRefund = ({ event, checkoutConfig }: StakeRefundProps) => {
  // TODO: handle when there is more than 1 lock?
  const lockAddress = Object.keys(checkoutConfig.config.locks)[0]
  const network = (checkoutConfig.config.locks[lockAddress].network ||
    checkoutConfig.config.network)!

  const {
    isLoading: isLoadingRefunds,
    mutate: approveRefunds,
    data: newRefunds,
  } = useMutation(async () => {
    const response = await locksmith.approveRefunds(
      event.slug,
      event.attendeeRefund!
    )
    return response.data
  })

  const { data: approvedRefunds, isLoading } = useQuery(
    ['getRefunds', event.slug],
    async () => {
      const response = await locksmith.approvedRefunds(event.slug)
      return response.data
    }
  )

  console.log({ approvedRefunds, newRefunds, isLoading })

  const refundsToApprove = approvedRefunds || newRefunds

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="sm" />
      </Placeholder.Root>
    )
  }
  if (refundsToApprove) {
    return (
      <div>
        <p className="mb-4">
          At this point, {refundsToApprove.values.length} attendees have been
          checked-in and could claim a refund, if you approve them.
        </p>
        <ul className="flex flex-col gap-4">
          <li className="flex">
            <SetKickbackContractAsLockManager
              event={event}
              refundsToApprove={refundsToApprove}
              lockAddress={lockAddress}
              network={network}
            />
          </li>
          <li className="flex">
            <SaveRootForRefunds
              event={event}
              refundsToApprove={refundsToApprove}
              lockAddress={lockAddress}
              network={network}
            />
          </li>
        </ul>
      </div>
    )
  }
  return (
    <Button loading={isLoadingRefunds} onClick={() => approveRefunds()}>
      Prepare Refunds
    </Button>
  )
}
