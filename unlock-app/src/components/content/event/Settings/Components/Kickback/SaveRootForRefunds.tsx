import { ToastHelper } from '~/components/helpers/toast.helper'
import { config } from '~/config/app'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ethers } from 'ethers'
import { useMutation, useQuery } from '@tanstack/react-query'
import KickbackAbi from './KickbackAbi'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { Event } from '@unlock-protocol/core'
import { useProvider } from '~/hooks/useProvider'

interface SaveRootForRefundsProps {
  refundsToApprove: any
  event: Event
  lockAddress: string
  network: number
  approveRefundsMutation: any
  refetchApprovedRefunds: any
}

export const SaveRootForRefunds = ({
  refundsToApprove,
  event,
  lockAddress,
  network,
  approveRefundsMutation,
  refetchApprovedRefunds,
}: SaveRootForRefundsProps) => {
  const { kickbackAddress } = config.networks[event.attendeeRefund!.network]
  const web3Service = useWeb3Service()
  const provider = web3Service.providerForNetwork(network)
  const { getWalletService } = useProvider()

  const {
    data: proof,
    isPending: isLoadingProof,
    refetch: refetchProof,
  } = useQuery({
    queryKey: ['getProof', lockAddress],
    queryFn: async () => {
      const contract = new ethers.Contract(
        kickbackAddress!,
        KickbackAbi,
        provider
      )

      return contract.roots(lockAddress)
    },
  })

  const setProof = useMutation({
    mutationFn: async (root: string) => {
      const walletService = await getWalletService(network)
      const contract = new ethers.Contract(
        kickbackAddress!,
        KickbackAbi,
        walletService.signer
      )

      await ToastHelper.promise(
        contract
          .approveRefunds(lockAddress, root)
          .then((tx: any) => tx.wait())
          .then(() => refetchProof())
          .then(() => refetchApprovedRefunds()),
        {
          success: 'Refunds have been approved.',
          error:
            'We could not save your event. Please try again and report if the issue persists.',
          loading: 'Saving the list of attendees who can claim a refund.',
        }
      )
    },
  })

  const addProof = async () => {
    await setProof.mutateAsync(refundsToApprove.tree[0])
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
        <p>
          ✅ The list of attendees approved for refunds has been saved.{' '}
          <Button
            loading={approveRefundsMutation.isPending || setProof.isPending}
            size="tiny"
            onClick={async () => {
              const newTree = await approveRefundsMutation.mutateAsync()
              await setProof.mutateAsync(newTree.tree[0])
              await refetchApprovedRefunds()
            }}
          >
            Update the list
          </Button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <p>
        ❌ And finally you need to save the list of users who are approved for
        refunds.
      </p>
      <Button onClick={addProof} loading={setProof.isPending} size="small">
        Save approved attendees
      </Button>
    </div>
  )
}
