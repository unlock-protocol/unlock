'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, TextBox, ToastHelper } from '@unlock-protocol/ui'
import { Contract, isError } from 'ethers'
import { useRouter } from 'next/navigation'
import { governanceEnv } from '~/config/env'
import { governanceConfig } from '~/config/governance'
import { useConnectModal } from '~/hooks/useConnectModal'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'
import { formatRelativeTime, formatTokenAmount } from '~/lib/governance/format'
import {
  getTokenContract,
  getRpcProvider,
  governorAbi,
} from '~/lib/governance/rpc'
import type { ProposalState } from '~/lib/governance/types'

type ProposalWritePanelProps = {
  calldatas: string[]
  descriptionHash: string
  etaSeconds: string | null
  proposalId: string
  state: ProposalState
  targets: string[]
  tokenSymbol: string
  values: string[]
}

type VoteStatus = {
  support: number | null
  tokenBalance: bigint
  votingPower: bigint
}

// ProposalWritePanel intentionally contains no hooks — the early-return guard
// below is only safe because of this. All hooks live in ProposalWritePanelConnected.
export function ProposalWritePanel(props: ProposalWritePanelProps) {
  if (!governanceEnv.privyAppId) {
    return (
      <WalletStateCard
        title="Wallet actions require Privy configuration"
        description="Set NEXT_PUBLIC_PRIVY_APP_ID to enable voting, queueing, and execution flows locally."
      />
    )
  }

  return <ProposalWritePanelConnected {...props} />
}

function ProposalWritePanelConnected({
  calldatas,
  descriptionHash,
  etaSeconds,
  proposalId,
  state,
  targets,
  tokenSymbol,
  values,
}: ProposalWritePanelProps) {
  const { address, authenticated, getSigner, isReady } = useGovernanceWallet()
  const { openConnectModal } = useConnectModal()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [pendingSupport, setPendingSupport] = useState<0 | 1 | 2 | null>(null)
  // Tick every 15s while Queued so canExecute activates without a reload.
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)))
  useEffect(() => {
    if (state !== 'Queued') return
    const id = setInterval(
      () => setNow(BigInt(Math.floor(Date.now() / 1000))),
      15_000
    )
    return () => clearInterval(id)
  }, [state])

  const voteStatusQuery = useQuery({
    enabled: Boolean(address),
    queryKey: ['proposal-vote-status', proposalId, address],
    queryFn: async (): Promise<VoteStatus> => {
      const governor = new Contract(
        governanceConfig.governorAddress,
        governorAbi,
        getRpcProvider()
      )
      // Query votingPower and the user's cast vote in parallel.
      // Vote lookup uses the subgraph to avoid queryFilter block-range limits.
      const snapshotBlock = (await governor.proposalSnapshot(
        BigInt(proposalId)
      )) as bigint
      if (!address) return { support: null, tokenBalance: 0n, votingPower: 0n }
      const [votingPower, tokenBalance, voteData] = await Promise.all([
        governor.getVotes(address, snapshotBlock) as Promise<bigint>,
        getTokenContract().balanceOf(address) as Promise<bigint>,
        fetchVoteFromSubgraph(proposalId, address),
      ])

      return { support: voteData, tokenBalance, votingPower }
    },
  })

  const voteMutation = useMutation({
    mutationFn: async (support: 0 | 1 | 2) => {
      setPendingSupport(support)
      // getSigner() calls ensureBaseNetwork() which switches to Base or throws.
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

      ToastHelper.success(`Vote submitted — tx: ${tx.hash.slice(0, 10)}…`)
      await tx.wait()
    },
    onError: (error) => {
      setPendingSupport(null)
      ToastHelper.error(toUserMessage(error, 'Unable to cast vote.'))
    },
    onSuccess: async (_, support) => {
      ToastHelper.success(`Vote confirmed on ${governanceConfig.chainName}.`)
      setPendingSupport(null)
      setReason('')
      // Optimistically update the query cache — the subgraph lags behind chain
      // state, so refetching immediately would return stale data and re-enable
      // the vote buttons. Setting the cache directly keeps the UI consistent.
      // router.refresh() is intentionally omitted here: RSC page data does not
      // change when a vote is cast, and calling it would race against the
      // optimistic update by triggering a background refetch of stale data.
      queryClient.setQueryData(
        ['proposal-vote-status', proposalId, address],
        (prev: VoteStatus | undefined) =>
          prev ? { ...prev, support } : undefined
      )
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

      // Pre-flight: read on-chain state to give a clear error before spending
      // gas. The subgraph state can lag, so this catches state mismatches early.
      const onChainState = (await governor.state(BigInt(proposalId))) as bigint
      const expectedState = action === 'queue' ? 4n : 5n // 4=Succeeded, 5=Queued
      if (onChainState !== expectedState) {
        const stateLabels: Record<string, string> = {
          '0': 'Pending',
          '1': 'Active',
          '2': 'Canceled',
          '3': 'Defeated',
          '4': 'Succeeded',
          '5': 'Queued',
          '6': 'Expired',
          '7': 'Executed',
        }
        const label =
          stateLabels[onChainState.toString()] ?? `state ${onChainState}`
        throw new Error(
          action === 'queue'
            ? `Cannot queue: proposal is ${label} on-chain (expected Succeeded).`
            : `Cannot execute: proposal is ${label} on-chain (expected Queued).`
        )
      }

      const tx =
        action === 'queue'
          ? await governor.queue(
              targets,
              values.map((value) => BigInt(value || '0')),
              calldatas,
              descriptionHash
            )
          : await governor.execute(
              targets,
              values.map((value) => BigInt(value || '0')),
              calldatas,
              descriptionHash
            )

      ToastHelper.success(
        `${action === 'queue' ? 'Queue' : 'Execution'} submitted — tx: ${tx.hash.slice(0, 10)}…`
      )
      await tx.wait()
    },
    onError: (error) => {
      ToastHelper.error(toUserMessage(error, 'Unable to submit action.'))
    },
    onSuccess: async (_, action) => {
      ToastHelper.success(
        action === 'queue' ? 'Proposal queued.' : 'Proposal executed.'
      )
      queryClient.invalidateQueries({
        queryKey: ['proposal-vote-status', proposalId, address],
      })
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
          action={<Button onClick={openConnectModal}>Connect wallet</Button>}
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
          {/* Show cast vote only when voting is open or the user already voted. */}
          {state === 'Active' || userSupport !== null ? (
            <>
              {/* No voting power — either no tokens at all, or tokens not delegated. */}
              {!voteStatusQuery.isLoading &&
              !voteStatusQuery.isError &&
              userSupport === null &&
              voteStatusQuery.data?.votingPower === 0n ? (
                <WalletStateCard
                  title="No voting power"
                  description={
                    voteStatusQuery.data.tokenBalance > 0n
                      ? `You held ${formatTokenAmount(voteStatusQuery.data.tokenBalance)} ${tokenSymbol} but had not delegated at the proposal snapshot. Delegate your tokens before the next proposal to participate.`
                      : `You held no ${tokenSymbol} at the proposal snapshot block.`
                  }
                  action={
                    voteStatusQuery.data.tokenBalance > 0n ? (
                      <Button
                        as="a"
                        href="/delegates"
                        size="small"
                        variant="outlined-primary"
                      >
                        Delegate tokens
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
                    Cast vote
                  </h3>
                  <div className="mt-4 rounded-3xl bg-ui-secondary-200 p-5">
                    <div className="text-sm text-brand-ui-primary/65">
                      Voting power at snapshot
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
                      {voteStatusQuery.isLoading
                        ? 'Loading…'
                        : voteStatusQuery.isError
                          ? 'Unavailable'
                          : `${formatTokenAmount(voteStatusQuery.data?.votingPower ?? 0n)} ${tokenSymbol}`}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                      {voteStatusQuery.isLoading
                        ? 'Fetching your voting power…'
                        : voteStatusQuery.isError
                          ? 'Could not load vote status. Check your connection and reload.'
                          : userSupport !== null
                            ? `You voted ${supportLabel(userSupport)}.`
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

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Button
                      disabled={!canVote || voteMutation.isPending}
                      loading={pendingSupport === 1 && voteMutation.isPending}
                      onClick={() => voteMutation.mutate(1)}
                      size="small"
                    >
                      Vote For
                    </Button>
                    <Button
                      disabled={!canVote || voteMutation.isPending}
                      loading={pendingSupport === 0 && voteMutation.isPending}
                      onClick={() => voteMutation.mutate(0)}
                      size="small"
                      variant="outlined-primary"
                    >
                      Vote Against
                    </Button>
                    <Button
                      disabled={!canVote || voteMutation.isPending}
                      loading={pendingSupport === 2 && voteMutation.isPending}
                      onClick={() => voteMutation.mutate(2)}
                      size="small"
                      variant="secondary"
                    >
                      Abstain
                    </Button>
                  </div>
                </section>
              )}
            </>
          ) : null}

          {(canQueue || state === 'Queued') && (
            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
                Lifecycle action
              </h3>
              <div className="mt-4 rounded-3xl bg-ui-secondary-200 p-5">
                <div className="text-lg font-semibold text-brand-ui-primary">
                  {canQueue
                    ? 'Queue proposal'
                    : canExecute
                      ? 'Execute proposal'
                      : 'Waiting for timelock'}
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                  {canQueue
                    ? 'This proposal passed and can now be queued in the timelock.'
                    : canExecute
                      ? 'The timelock delay has elapsed. Execution is now available.'
                      : etaSeconds
                        ? `Execution unlocks ${formatRelativeTime(BigInt(etaSeconds), now)}.`
                        : 'Queued — waiting for the timelock ETA to be set.'}
                </p>
              </div>

              {(canQueue || canExecute) && (
                <div className="mt-5">
                  <Button
                    loading={actionMutation.isPending}
                    onClick={() =>
                      actionMutation.mutate(canQueue ? 'queue' : 'execute')
                    }
                  >
                    {canQueue ? 'Queue proposal' : 'Execute proposal'}
                  </Button>
                </div>
              )}
            </section>
          )}
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

async function fetchVoteFromSubgraph(
  proposalId: string,
  voter: string
): Promise<number | null> {
  // Vote ID in the subgraph is "<proposalId>-<lowercaseAddress>".
  // Format defined in subgraph/src/governance.ts createVote():
  //   new Vote(proposalId.toString().concat('-').concat(voter.toHexString()))
  const id = `${proposalId}-${voter.toLowerCase()}`
  // Use variables to avoid GraphQL string injection.
  const query = `query ($id: ID!) { vote(id: $id) { support } }`
  const response = await fetch(governanceConfig.subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok)
    throw new Error(`Subgraph request failed: ${response.status}`)
  const json = await response.json()
  if (json?.errors?.length)
    throw new Error(`Subgraph error: ${json.errors[0].message}`)
  // Validate that the response has the expected shape before reading data.
  if (!json?.data) throw new Error('Unexpected subgraph response: missing data')
  // null means the vote entity does not exist — user has not voted.
  const vote = json.data.vote
  if (!vote) return null
  const support = Number(vote.support)
  return [0, 1, 2].includes(support) ? support : null
}

function toUserMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback
  // ethers ACTION_REJECTED = user cancelled the wallet popup
  if (isError(error, 'ACTION_REJECTED')) return 'Transaction rejected.'
  // ethers CALL_EXCEPTION carries a clean reason string — use it directly.
  if (isError(error, 'CALL_EXCEPTION') && error.reason) return error.reason
  // For other errors, strip only verbose RPC context that appears after a
  // newline, keeping the first line which usually has the useful message.
  const firstLine = error.message.split('\n')[0].trim()
  return firstLine.slice(0, 160) || fallback
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
