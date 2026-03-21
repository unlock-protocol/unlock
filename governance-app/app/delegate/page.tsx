// ABOUTME: Delegation page — shows wallet balance, voting power, current delegate,
// and a form to change it. Requires a connected wallet (use the header Connect button).
'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AddressInput, Button, ToastHelper } from '@unlock-protocol/ui'
import {
  Contract,
  getAddress,
  isAddress,
  JsonRpcProvider,
  Network,
} from 'ethers'
import Link from 'next/link'
import { governanceConfig } from '~/config/governance'
import { formatTokenAmount, truncateAddress } from '~/lib/governance/format'
import { getTokenSymbol, tokenAbi } from '~/lib/governance/rpc'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'

const zeroAddress = '0x0000000000000000000000000000000000000000'

type DelegateAccountState = {
  delegatedTo: string
  tokenBalance: bigint
  votingPower: bigint
}

export default function DelegatePage() {
  const { address, getSigner } = useGovernanceWallet()
  const [delegateInput, setDelegateInput] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('UP')

  useEffect(() => {
    getTokenSymbol().then(setTokenSymbol)
  }, [])

  const delegationQuery = useQuery({
    enabled: Boolean(address),
    queryKey: ['delegate-account', address],
    queryFn: async (): Promise<DelegateAccountState> => {
      const provider = new JsonRpcProvider(
        governanceConfig.rpcUrl,
        governanceConfig.chainId
      )
      const token = new Contract(
        governanceConfig.tokenAddress,
        tokenAbi,
        provider
      )
      const [delegatedTo, tokenBalance, votingPower] = await Promise.all([
        token.delegates(address) as Promise<string>,
        token.balanceOf(address) as Promise<bigint>,
        token.getVotes(address) as Promise<bigint>,
      ])

      return {
        delegatedTo: getAddress(delegatedTo),
        tokenBalance,
        votingPower,
      }
    },
  })

  useEffect(() => {
    if (!delegationQuery.data || delegateInput.trim()) return
    const { delegatedTo } = delegationQuery.data
    setDelegateInput(delegatedTo === zeroAddress ? '' : delegatedTo)
  }, [delegateInput, delegationQuery.data])

  const delegateMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Connect a wallet before delegating.')
      const candidate = delegateInput.trim()
      if (!candidate) throw new Error('Enter a delegate address.')
      if (!isAddress(candidate))
        throw new Error('Enter a valid Ethereum address.')
      const resolvedAddress = getAddress(candidate)
      const signer = await getSigner()
      const token = new Contract(
        governanceConfig.tokenAddress,
        tokenAbi,
        signer
      )
      const tx = await token.delegate(resolvedAddress)
      ToastHelper.success('Delegation transaction submitted.')
      await tx.wait()
      return resolvedAddress
    },
    onError: (error) => {
      ToastHelper.error(
        error instanceof Error ? error.message : 'Unable to update delegation.'
      )
    },
    onSuccess: async (resolvedAddress) => {
      ToastHelper.success(
        `Delegation updated to ${truncateAddress(resolvedAddress)}.`
      )
      setDelegateInput(resolvedAddress)
      await delegationQuery.refetch()
    },
  })

  const delegationState = delegationQuery.data?.delegatedTo || zeroAddress
  const isNotDelegated = delegationState === zeroAddress
  const isSelfDelegated =
    !isNotDelegated && delegationState.toLowerCase() === address?.toLowerCase()

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
          Personal Delegation
        </p>
        <h2 className="mt-4 text-4xl font-semibold text-brand-ui-primary">
          Manage your Unlock DAO voting power
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-brand-ui-primary/72">
          Review your current UP balance and voting power, and delegate to
          yourself or another address. Delegating to your own address activates
          your voting power without handing it to someone else.
        </p>
      </div>

      {address && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/45">
                  Connected wallet
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-brand-ui-primary">
                  {truncateAddress(address, 6)}
                </h3>
              </div>
              <Link
                className="rounded-full border border-brand-ui-primary/15 px-4 py-2 text-sm font-semibold text-brand-ui-primary transition hover:border-brand-ui-primary/30"
                href="/delegates"
              >
                View leaderboard
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-ui-secondary-200 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                  UP balance
                </div>
                <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
                  {formatTokenAmount(delegationQuery.data?.tokenBalance || 0n)}{' '}
                  {tokenSymbol}
                </div>
              </div>
              <div className="rounded-3xl bg-ui-secondary-200 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                  Current voting power
                </div>
                <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
                  {formatTokenAmount(delegationQuery.data?.votingPower || 0n)}{' '}
                  {tokenSymbol}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-ui-secondary-200 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                Current delegate
              </div>
              <div className="mt-2 text-lg font-semibold text-brand-ui-primary">
                {delegationQuery.isLoading
                  ? 'Loading...'
                  : isNotDelegated
                    ? 'Not delegated'
                    : truncateAddress(delegationState, 6)}
              </div>
              <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                {isNotDelegated
                  ? 'Voting power is inactive until you delegate, including self-delegation.'
                  : isSelfDelegated
                    ? 'Your voting power is active and delegated to your own wallet.'
                    : 'Your voting power is currently delegated to another address.'}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/45">
              Change delegate
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-brand-ui-primary">
              Delegate to an address or ENS name
            </h3>
            <p className="mt-3 text-sm leading-6 text-brand-ui-primary/70">
              The transaction will prompt your wallet to switch to Base before
              submitting if needed.
            </p>

            <div className="mt-6 space-y-4">
              <AddressInput
                description="Enter an Ethereum address, ENS name, or Basename."
                disabled={delegateMutation.isPending}
                label="Delegate target"
                onChange={(value: any) => setDelegateInput(value)}
                onResolveName={resolveNameForInput}
                placeholder="vitalik.eth or 0x..."
                value={delegateInput}
                withIcon
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={delegateMutation.isPending}
                  onClick={() => setDelegateInput(address)}
                  variant="outlined-primary"
                >
                  Self-delegate
                </Button>
                <Button
                  disabled={
                    !delegateInput.trim() ||
                    delegateMutation.isPending ||
                    delegationQuery.isLoading
                  }
                  loading={delegateMutation.isPending}
                  onClick={() => delegateMutation.mutate()}
                >
                  Save delegation
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

async function resolveNameForInput(input: string) {
  const candidate = input.trim()

  if (isAddress(candidate)) {
    return { type: 'address', address: getAddress(candidate) }
  }

  const mainnetProvider = new JsonRpcProvider(
    governanceConfig.mainnetRpcUrl,
    Network.from(1)
  )
  const ensAddress = await mainnetProvider.resolveName(candidate)
  if (ensAddress) {
    return { type: 'name', address: getAddress(ensAddress) }
  }

  const baseProvider = new JsonRpcProvider(
    governanceConfig.rpcUrl,
    Network.from(8453)
  )
  const basenameAddress = await baseProvider.resolveName(candidate)
  if (basenameAddress) {
    return { type: 'name', address: getAddress(basenameAddress) }
  }

  return { type: 'error' }
}
