// ABOUTME: Client component for the personal delegation form — shows wallet balance,
// voting power, current delegate, and a form to change it.
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AddressInput, Button, ToastHelper } from '@unlock-protocol/ui'
import {
  Contract,
  getAddress,
  isAddress,
  JsonRpcProvider,
  Network,
  ZeroAddress,
} from 'ethers'
import { governanceConfig } from '~/config/governance'
import { formatTokenAmount, truncateAddress } from '~/lib/governance/format'
import { getTokenSymbol, tokenAbi } from '~/lib/governance/rpc'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'

type DelegateAccountState = {
  delegatedTo: string
  tokenBalance: bigint
  votingPower: bigint
}

export function DelegateFormSection() {
  const { address, authenticated, getSigner } = useGovernanceWallet()
  const searchParams = useSearchParams()
  const [delegateInput, setDelegateInput] = useState(
    () => searchParams.get('delegate') ?? ''
  )
  const [addressInputKey, setAddressInputKey] = useState(0)
  const [tokenSymbol, setTokenSymbol] = useState('UP')

  // AddressInput manages its own internal state initialized from `value` on mount.
  // This helper increments the key to force a remount when we set the value externally.
  function setDelegateInputExternal(value: string) {
    setDelegateInput(value)
    setAddressInputKey((k) => k + 1)
  }

  // Pre-fill when the ?delegate= query param changes (e.g. from leaderboard row button).
  useEffect(() => {
    const target = searchParams.get('delegate')
    if (target && isAddress(target)) {
      setDelegateInputExternal(getAddress(target))
    }
  }, [searchParams])

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
    setDelegateInputExternal(delegatedTo === ZeroAddress ? '' : delegatedTo)
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

  const delegationState = delegationQuery.data?.delegatedTo || ZeroAddress
  const isNotDelegated = delegationState === ZeroAddress
  const isSelfDelegated =
    !isNotDelegated && delegationState.toLowerCase() === address?.toLowerCase()

  if (!authenticated || !address) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
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
            key={addressInputKey}
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
              onClick={() => setDelegateInputExternal(address!)}
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
