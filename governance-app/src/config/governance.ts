import {
  UPGovernor,
  UPTimelock,
  UPToken,
  Unlock,
} from '@unlock-protocol/contracts'
import { base, mainnet } from '@unlock-protocol/networks'
import { governanceEnv } from './env'

// UP token address — from packages/networks base.tokens where symbol === 'UP'
const upTokenAddress =
  base.tokens?.find((t) => t.symbol === 'UP')?.address ||
  '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

export const governanceConfig = {
  chainId: 8453,
  chainName: 'Base',
  mainnetRpcUrl: governanceEnv.mainnetRpcUrl || mainnet.provider,
  governorAddress:
    base.dao?.governor || '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  governorStartBlock: base.startBlock || 1750000,
  proposalQuorumMode: 'for,abstain',
  rpcUrl: governanceEnv.baseRpcUrl || base.provider,
  subgraphUrl:
    governanceEnv.baseSubgraphUrl ||
    'https://subgraph.unlock-protocol.com/8453',
  timelockAddress: '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
  tokenAddress: upTokenAddress,
  explorerUrl: 'https://basescan.org',
  knownContracts: [
    {
      label: 'UPGovernor',
      address:
        base.dao?.governor || '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
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
      // Canonical Base timelock address — matches packages/networks/src/networks/base.ts dao.timelock
      address: '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
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
