import {
  UPGovernor,
  UPTimelock,
  UPToken,
  PublicLock,
  Unlock,
} from '@unlock-protocol/contracts'
import { base } from '@unlock-protocol/networks'
import { governanceEnv } from './env'

export const governanceConfig = {
  chainId: 8453,
  chainName: 'Base',
  governorAddress:
    base.dao?.governor || '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9',
  governorStartBlock: base.startBlock || 1750000,
  proposalQuorumMode: 'for,abstain',
  rpcUrl: governanceEnv.baseRpcUrl || base.provider,
  subgraphUrl:
    governanceEnv.baseSubgraphUrl ||
    'https://subgraph.unlock-protocol.com/8453',
  timelockAddress: '0xB34567C4cA697b39F72e1a8478f285329A98ed1b',
  tokenAddress: '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187',
  knownContracts: [
    { label: 'UPGovernor', abi: UPGovernor, kind: 'governor' },
    { label: 'UPToken', abi: UPToken, kind: 'token' },
    { label: 'UPTimelock', abi: UPTimelock, kind: 'timelock' },
    { label: 'Unlock', abi: Unlock, kind: 'unlock' },
    { label: 'PublicLock', abi: PublicLock, kind: 'publicLock' },
  ],
} as const

export const governanceRoutes = [
  { href: '/', label: 'Home' },
  { href: '/proposals', label: 'Proposals' },
  { href: '/delegates', label: 'Delegates' },
  { href: '/treasury', label: 'Treasury' },
  { href: '/delegate', label: 'My Delegation' },
  { href: '/propose', label: 'New Proposal' },
] as const
