import {
  UPGovernor,
  UPTimelock,
  UPToken,
  Unlock,
} from '@unlock-protocol/contracts'
import { base, mainnet } from '@unlock-protocol/networks'
import { governanceEnv } from './env'

// UP token address — from packages/networks base.tokens where symbol === 'UP'
const upTokenAddress = base.tokens?.find((t) => t.symbol === 'UP')?.address
if (!upTokenAddress) {
  throw new Error(
    'UP token address not found in @unlock-protocol/networks base.tokens — update the networks package.'
  )
}

// Canonical Base governor — must be provided by @unlock-protocol/networks
const governorAddress = base.dao?.governor
if (!governorAddress) {
  throw new Error(
    'Governor address not found in @unlock-protocol/networks base.dao.governor — update the networks package.'
  )
}

// Canonical Base timelock — packages/networks NetworkConfig.dao does not expose
// timelock yet, so this is hardcoded; update if the networks package adds it.
const timelockAddress = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'

export const governanceConfig = {
  chainId: 8453,
  chainName: 'Base',
  mainnetRpcUrl: governanceEnv.mainnetRpcUrl || mainnet.provider,
  governorAddress,
  governorStartBlock: base.startBlock || 1750000,
  proposalQuorumMode: 'for,abstain',
  rpcUrl: governanceEnv.baseRpcUrl || base.provider,
  subgraphUrl:
    governanceEnv.baseSubgraphUrl ||
    'https://subgraph.unlock-protocol.com/8453',
  timelockAddress,
  tokenAddress: upTokenAddress,
  explorerUrl: 'https://basescan.org',
  knownContracts: [
    {
      label: 'UPGovernor',
      address: governorAddress,
      abi: UPGovernor,
      kind: 'governor',
    },
    {
      label: 'UPToken',
      address: upTokenAddress,
      abi: UPToken,
      kind: 'token',
    },
    {
      label: 'UPTimelock',
      address: timelockAddress,
      abi: UPTimelock,
      kind: 'timelock',
    },
    {
      label: 'Unlock',
      address: base.unlockAddress || '',
      abi: Unlock,
      kind: 'unlock',
    },
    // PublicLock is intentionally excluded — every Lock is a separate deployed
    // instance; users must supply the specific address via "Custom contract".
  ],
} as const

export function txExplorerUrl(hash: string) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return null
  return `${governanceConfig.explorerUrl}/tx/${hash}`
}

export function addressExplorerUrl(address: string) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return null
  return `${governanceConfig.explorerUrl}/address/${address}`
}

export const governanceRoutes = [
  { href: '/', label: 'Home' },
  { href: '/proposals', label: 'Proposals' },
  { href: '/delegates', label: 'Delegates' },
  { href: '/treasury', label: 'Treasury' },
  { href: '/propose', label: 'New Proposal' },
] as const
