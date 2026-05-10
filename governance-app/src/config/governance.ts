import {
  UPGovernor,
  UPTimelock,
  UPToken,
  Unlock,
} from '@unlock-protocol/contracts'
import { base, mainnet } from '@unlock-protocol/networks'
import { governanceEnv } from './env'

// UP token address — from packages/networks base.tokens where symbol === 'UP'.
// console.error surfaces misconfiguration without crashing the app on startup.
const _upToken = base.tokens?.find((t) => t.symbol === 'UP')?.address
if (!_upToken) {
  // eslint-disable-next-line no-console
  console.error(
    '[governance-app] UP token address missing from @unlock-protocol/networks — update the package'
  )
}
const upTokenAddress = _upToken || '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

// Canonical Base governor.  Same warn-and-fallback pattern.
const _governor = base.dao?.governor
if (!_governor) {
  // eslint-disable-next-line no-console
  console.error(
    '[governance-app] base.dao.governor missing from @unlock-protocol/networks — update the package'
  )
}
const governorAddress =
  _governor || '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9'

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
