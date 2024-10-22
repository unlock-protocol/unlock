import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { Button, Card, Placeholder } from '@unlock-protocol/ui'
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { MdAssignmentLate } from 'react-icons/md'
import { useHasClaimedRefund } from '~/hooks/useHasClaimedRefund'
import { useMutation } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { config } from '~/config/app'
import KickbackAbi from '../../Settings/Components/Kickback/KickbackAbi'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useGetApprovedRefunds } from '~/hooks/useGetApprovedRefunds'
import { useMemo } from 'react'
import { EventLocksExplorerLinks } from './EventLocksExplorerLinks'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

export const ClaimRefund = ({
  refundProofAndValue,
  lockAddress,
  network,
  refreshHasClaimedRefund,
}: {
  refreshHasClaimedRefund: () => void
  refundProofAndValue: any
  lockAddress: string
  network: number
}) => {
  // TODO: Check if balance on lock is enough, show error if not!
  const { getWalletService } = useProvider()
  const { kickbackAddress } = config.networks[network]

  const claimRefund = useMutation({
    mutationFn: async () => {
      const walletService = await getWalletService(network)
      const contract = new ethers.Contract(
        kickbackAddress!,
        KickbackAbi,
        walletService.signer
      )

      await ToastHelper.promise(
        contract
          .refund(
            lockAddress,
            refundProofAndValue.proof,
            refundProofAndValue.leaf[1]
          )
          .then((tx: any) => tx.wait())
          .then(() => refreshHasClaimedRefund()),
        {
          success: 'Your refund has been issued!',
          error: 'We could not issue your refund. Please try again later.',
          loading: 'Issuing refund...',
        }
      )
    },
  })

  const claim = async () => {
    await claimRefund.mutateAsync()
  }

  return (
    <>
      <p>You attended this event and your wallet is eligible for a refund!</p>
      <Button onClick={claim} loading={claimRefund.isPending}>
        Claim Refund
      </Button>
    </>
  )
}

export const ClaimRefundInfo = ({
  event,
  checkoutConfig,
}: {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}) => {
  const lockAddress = Object.keys(checkoutConfig.config.locks)[0]
  const network = (checkoutConfig.config.locks[lockAddress].network ||
    checkoutConfig.config.network)!

  const { account } = useAuthenticate()
  const {
    data: hasClaimedRefund,
    isLoading: isLoadingHasClaimedRefund,
    refetch: refreshHasClaimedRefund,
  } = useHasClaimedRefund(lockAddress, network, account)

  const { data: approvedRefunds } = useGetApprovedRefunds(event)

  const refundProofAndValue = useMemo(() => {
    if (!approvedRefunds || !account) {
      return false
    }
    // @ts-expect-error Type 'any[] | undefined' is not assignable to type 'any[]'.
    const tree = StandardMerkleTree.load(approvedRefunds)
    for (const [i, leaf] of tree.entries()) {
      if (leaf[0].toLowerCase() === account.toLowerCase()) {
        const proof = tree.getProof(i)
        return { leaf, proof }
      }
    }
    return false
  }, [approvedRefunds, account])

  if (!account) {
    return (
      <p>
        This event is configured to refund its attendees! Please connect your
        wallet to check if you are eligible!
      </p>
    )
  }

  if (isLoadingHasClaimedRefund) {
    return (
      <Placeholder.Root>
        <Placeholder.Line size="md" />
      </Placeholder.Root>
    )
  }

  if (hasClaimedRefund) {
    return (
      <p>
        You have already claimed a refund for this event. Thank you for
        attending!
      </p>
    )
  }

  if (!refundProofAndValue) {
    return (
      <>
        <p>
          It looks like your wallet is <strong>not eligible</strong> for a
          refund.
        </p>
        <p>
          If you think this is a mistake because you attended the event, please
          get in touch with the organizers.
        </p>
      </>
    )
  }
  return (
    <ClaimRefund
      refreshHasClaimedRefund={refreshHasClaimedRefund}
      refundProofAndValue={refundProofAndValue}
      lockAddress={lockAddress}
      network={network}
    />
  )
}

export const PastEvent = ({
  event,
  checkoutConfig,
}: {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}) => {
  // Check here if the user has a ticket?
  // If so, show ClaimRefundInfo
  if (event.attendeeRefund) {
    return (
      <Card className="grid gap-4 mt-5 md:mt-0">
        <ClaimRefundInfo event={event} checkoutConfig={checkoutConfig} />
      </Card>
    )
  }
  return (
    <Card className="grid gap-4 mt-5 md:mt-0">
      <EventLocksExplorerLinks checkoutConfig={checkoutConfig} />
      <p className="text-lg">
        <MdAssignmentLate className="inline" />
        This event is over. It is not possible to register for it anymore.
      </p>
    </Card>
  )
}

export default PastEvent
