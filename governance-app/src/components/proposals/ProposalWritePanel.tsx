'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, TextBox, ToastHelper } from '@unlock-protocol/ui'
import { Contract, JsonRpcProvider } from 'ethers'
import { useRouter } from 'next/navigation'
import { governanceEnv } from '~/config/env'
import { governanceConfig } from '~/config/governance'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'
import { formatRelativeTime, formatTokenAmount } from '~/lib/governance/format'
import { governorAbi } from '~/lib/governance/rpc'
import type { ProposalState } from '~/lib/governance/types'

type ProposalWritePanelProps = {
  calldatas: string[]
  descriptionHash: string
  etaSeconds: string | null
  latestTimestamp: string
  proposalId: string
  state: ProposalState
  targets: string[]
  tokenSymbol: string
  values: string[]
  voteStartTimestamp: string
}

type VoteStatus = {
  support: number | null
  votingPower: bigint
}

export function ProposalWritePanel(props: ProposalWritePanelProps) {
  if (!governanceEnv.privyAppId) {
    return (
      <>
        <WalletStateCard
          title="Wallet actions require Privy configuration"
          description="Set NEXT_PUBLIC_PRIVY_APP_ID to enable voting, queueing, and execution flows locally."
        />
      </>
    )
  }

  return <ProposalWritePanelConnected {...props} />
}

function ProposalWritePanelConnected({
  calldatas,
  descriptionHash,
  etaSeconds,
  latestTimestamp,
  proposalId,
  state,
  targets,
  tokenSymbol,
  values,
  voteStartTimestamp,
}: ProposalWritePanelProps) {
  const { address, authenticated, connect, getSigner, isReady } =
    useGovernanceWallet()
  const router = useRouter()
  const [reason, setReason] = useState('')
  const now = BigInt(latestTimestamp)

  const voteStatusQuery = useQuery({
    enabled: Boolean(address),
    queryKey: ['proposal-vote-status', proposalId, address],
    queryFn: async (): Promise<VoteStatus> => {
      const provider = new JsonRpcProvider(
        governanceConfig.rpcUrl,
        governanceConfig.chainId
      )
      const governor = new Contract(
        governanceConfig.governorAddress,
        governorAbi,
        provider
      )
      const [votingPower, voteEvents, voteWithParamsEvents] = await Promise.all(
        [
          governor.getVotes(
            address,
            BigInt(voteStartTimestamp)
          ) as Promise<bigint>,
          governor.queryFilter(
            governor.filters.VoteCast(address, BigInt(proposalId))
          ),
          governor.queryFilter(
            governor.filters.VoteCastWithParams(address, BigInt(proposalId))
          ),
        ]
      )

      const latestVoteEvent = [...voteEvents, ...voteWithParamsEvents].sort(
        (left, right) => right.blockNumber - left.blockNumber
      )[0]
      const parsedVote = latestVoteEvent
        ? governor.interface.parseLog(latestVoteEvent)
        : null

      return {
        support:
          parsedVote && 'support' in parsedVote.args
            ? Number(parsedVote.args.support)
            : null,
        votingPower,
      }
    },
  })

  const voteMutation = useMutation({
    mutationFn: async (support: 0 | 1 | 2) => {
      const signer = await getSigner()
      const governor = new Contract(
        governanceConfig.governorAddress,
        governorAbi,
        signer
      )
      const tx = reason.trim()
        ? await governor.castVoteWithReason(
            BigInt(proposalId),
            support,
            reason.trim()
          )
        : await governor.castVote(BigInt(proposalId), support)

      ToastHelper.success('Vote transaction submitted.')
      await tx.wait()
    },
    onError: (error) => {
      ToastHelper.error(
        error instanceof Error ? error.message : 'Unable to cast vote.'
      )
    },
    onSuccess: async () => {
      ToastHelper.success('Vote recorded on Base.')
      setReason('')
      await voteStatusQuery.refetch()
      router.refresh()
    },
  })

  const actionMutation = useMutation({
    mutationFn: async (action: 'queue' | 'execute') => {
      const signer = await getSigner()
      const governor = new Contract(
        governanceConfig.governorAddress,
        governorAbi,
        signer
      )
      const tx =
        action === 'queue'
          ? await governor.queue(
              targets,
              values.map((value) => BigInt(value)),
              calldatas,
              descriptionHash
            )
          : await governor.execute(
              targets,
              values.map((value) => BigInt(value)),
              calldatas,
              descriptionHash
            )

      ToastHelper.success(
        action === 'queue'
          ? 'Queue transaction submitted.'
          : 'Execution transaction submitted.'
      )
      await tx.wait()
    },
    onError: (error) => {
      ToastHelper.error(
        error instanceof Error ? error.message : 'Unable to submit action.'
      )
    },
    onSuccess: async (_, action) => {
      ToastHelper.success(
        action === 'queue' ? 'Proposal queued.' : 'Proposal executed.'
      )
      router.refresh()
    },
  })

  const userSupport = voteStatusQuery.data?.support ?? null
  const canVote =
    state === 'Active' &&
    voteStatusQuery.data &&
    voteStatusQuery.data.votingPower > 0n &&
    userSupport === null

  const canQueue = state === 'Succeeded'
  const canExecute =
    state === 'Queued' && !!etaSeconds && now >= BigInt(etaSeconds)

  return (
    <>
      {!authenticated ? (
        <WalletStateCard
          action={<Button onClick={() => connect()}>Connect wallet</Button>}
          title="Connect a wallet to interact with this proposal"
          description="Voting, queueing, and execution all require a connected wallet on Base."
        />
      ) : null}

      {authenticated && !address ? (
        <WalletStateCard
          title={isReady ? 'Select a wallet in Privy' : 'Loading wallet state'}
          description="Once a wallet is connected, this page will load your vote status and enable governance actions."
        />
      ) : null}

      {address ? (
        <>
          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
              Cast vote
            </h3>
            <div className="mt-4 rounded-3xl bg-ui-secondary-200 p-5">
              <div className="text-sm text-brand-ui-primary/65">
                Voting power at snapshot
              </div>
              <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
                {formatTokenAmount(voteStatusQuery.data?.votingPower || 0n)}{' '}
                {tokenSymbol}
              </div>
              <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                {userSupport !== null
                  ? `You voted ${supportLabel(userSupport)}.`
                  : state !== 'Active'
                    ? 'Voting is not currently active for this proposal.'
                    : voteStatusQuery.data &&
                        voteStatusQuery.data.votingPower === 0n
                      ? 'You had no voting power at the proposal snapshot.'
                      : 'Choose For, Against, or Abstain and optionally include a reason.'}
              </p>
            </div>

            <div className="mt-5">
              <TextBox
                description="Optional reason submitted on-chain with your vote."
                disabled={!canVote || voteMutation.isPending}
                label="Vote reason"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Share your rationale"
                rows={4}
                value={reason}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Button
                disabled={!canVote}
                loading={voteMutation.isPending}
                onClick={() => voteMutation.mutate(1)}
              >
                Vote For
              </Button>
              <Button
                disabled={!canVote}
                loading={voteMutation.isPending}
                onClick={() => voteMutation.mutate(0)}
                variant="outlined-primary"
              >
                Vote Against
              </Button>
              <Button
                disabled={!canVote}
                loading={voteMutation.isPending}
                onClick={() => voteMutation.mutate(2)}
                variant="secondary"
              >
                Abstain
              </Button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
              Lifecycle action
            </h3>
            <div className="mt-4 rounded-3xl bg-ui-secondary-200 p-5">
              <div className="text-lg font-semibold text-brand-ui-primary">
                {canQueue
                  ? 'Queue proposal'
                  : state === 'Queued'
                    ? canExecute
                      ? 'Execute proposal'
                      : 'Waiting for timelock'
                    : 'No action available'}
              </div>
              <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                {canQueue
                  ? 'This proposal passed and can now be queued in the timelock.'
                  : state === 'Queued' && etaSeconds
                    ? canExecute
                      ? 'The timelock delay has elapsed. Execution is now available.'
                      : `Execution unlocks ${formatRelativeTime(BigInt(etaSeconds), now)}.`
                    : 'Queueing and execution become available only after a proposal succeeds.'}
              </p>
            </div>

            <div className="mt-5">
              <Button
                disabled={!canQueue && !canExecute}
                loading={actionMutation.isPending}
                onClick={() =>
                  actionMutation.mutate(canQueue ? 'queue' : 'execute')
                }
              >
                {canQueue
                  ? 'Queue proposal'
                  : canExecute
                    ? 'Execute proposal'
                    : 'No action available'}
              </Button>
            </div>
          </section>
        </>
      ) : null}
    </>
  )
}

function WalletStateCard({
  action,
  description,
  title,
}: {
  action?: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-brand-ui-primary">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-brand-ui-primary/70">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  )
}

function supportLabel(support: number) {
  if (support === 0) {
    return 'Against'
  }

  if (support === 1) {
    return 'For'
  }

  return 'Abstain'
}
