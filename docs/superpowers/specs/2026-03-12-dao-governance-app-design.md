# Unlock DAO Governance App — Design Spec

**Date:** 2026-03-12
**Status:** Approved
**Replaces:** Tally UI at https://www.tally.xyz/gov/unlock-protocol

---

## Overview

A standalone Next.js governance app deployed at `vote.unlock-protocol.com` that replaces Tally as the primary UI for the Unlock Protocol DAO. Supports the full governance lifecycle: browsing proposals, voting, delegating voting power, and creating proposals. Targets the `UPGovernor` contract on Base only.

---

## Architecture

### New Monorepo App

- **Location:** `governance-app/` at monorepo root
- **Framework:** Next.js 14 (App Router, edge runtime)
- **Deployment:** Cloudflare Pages via `@cloudflare/next-on-pages` (free tier)
- **Domain:** `vote.unlock-protocol.com`

### Data Layer

Two data sources used together:

| Source                    | Used For                                                 |
| ------------------------- | -------------------------------------------------------- |
| The Graph (Base subgraph) | Historical proposals, vote tallies, delegation history   |
| Direct RPC via viem       | Live proposal state, user voting power, real-time counts |

React Query manages caching (stale-while-revalidate, 30s TTL). If The Graph is unavailable, the app falls back to direct RPC reads.

### Auth & Wallet

- **Privy** for wallet connection and social login — same configuration pattern as `unlock-app`
- **wagmi** for contract write transactions (vote, delegate, propose)
- Network guard: auto-prompt to switch to Base if user is on the wrong network

### Styling

- `@unlock-protocol/ui` component library throughout (Button, Card, Modal, Input, Badge, Tabs, etc.)
- Shared Tailwind preset (`@unlock-protocol/ui/dist/unlock-tailwind-preset`) for brand colors, typography (Inter), and design tokens
- Visually consistent with the rest of Unlock Protocol apps

---

## Subgraph Extensions

Extend `subgraph/config/base.json` and `subgraph/schema.graphql` to index governance data.

### New Entities

**Proposal**

```
id: ID!
proposer: String!
description: String!
state: String!           # Pending | Active | Canceled | Defeated | Succeeded | Queued | Executed
forVotes: BigInt!
againstVotes: BigInt!
abstainVotes: BigInt!
startTimestamp: BigInt!
endTimestamp: BigInt!
targets: [String!]!
values: [BigInt!]!
calldatas: [Bytes!]!
createdAt: BigInt!
queuedAt: BigInt
executedAt: BigInt
canceledAt: BigInt
transactionHash: String!
```

**Vote**

```
id: ID!                  # proposalId-voterAddress
proposal: Proposal!
voter: String!
support: Int!            # 0=against, 1=for, 2=abstain
weight: BigInt!
reason: String
createdAt: BigInt!
transactionHash: String!
```

**Delegate**

```
id: ID!                  # delegator address
delegatedTo: String!
votingPower: BigInt!
tokenBalance: BigInt!
updatedAt: BigInt!
```

### New Event Handlers

**UPGovernor contract (Base):**

- `ProposalCreated` → create Proposal entity
- `VoteCast` / `VoteCastWithParams` → create Vote entity, update Proposal vote counts
- `ProposalQueued` → update Proposal state and queuedAt
- `ProposalExecuted` → update Proposal state and executedAt
- `ProposalCanceled` → update Proposal state and canceledAt

**UPToken contract (Base):**

- `DelegateChanged` → update Delegate.delegatedTo
- `DelegateVotesChanged` → update Delegate.votingPower
- `Transfer` → update Delegate.tokenBalance (for from and to addresses)

---

## Pages & Features

### `/` — Proposal List

- Tabbed filter: All | Active | Pending | Succeeded | Defeated | Executed
- Each proposal card shows: title (first line of description), state badge, vote counts, time remaining or end date
- Sorted by creation date descending
- Public (no wallet required)

### `/proposals/[id]` — Proposal Detail

- Full proposal description (markdown rendered)
- Vote breakdown: for / against / abstain bars with percentages and raw counts
- Timeline: created → voting opens → voting closes → queued → executed
- Decoded calldata: show target contract, function name, and arguments in human-readable form
- Cast vote UI: For / Against / Abstain buttons + optional reason field
  - Requires connected wallet
  - Shows user's voting power at proposal snapshot
  - Disabled if already voted, voting not active, or no voting power
- Public browsing, wallet required to vote

### `/propose` — Create Proposal

- **Simple mode (default tab):**
  - Title field (becomes first line of description)
  - Description field (markdown, full proposal body)
  - Add target calls: contract address, function signature, arguments, ETH value
  - Multiple calls supported (add/remove)
- **Advanced mode (second tab):**
  - JSON editor accepting the same format as `governance/proposals/up/` CLI proposals:
    ```json
    {
      "proposalName": "...",
      "calls": [
        {
          "contractNameOrAbi": "...",
          "contractAddress": "0x...",
          "functionName": "...",
          "functionArgs": []
        }
      ]
    }
    ```
  - Validated on parse before submission
- Proposal threshold check on submit: show user's current voting power vs. required threshold; block submission if insufficient
- Wallet required to submit; browsing and drafting are open to all

### `/delegate` — Delegation

- Shows user's UP token balance
- Shows current delegate (self or another address)
- Change delegate: address input + confirm transaction
- Leaderboard section: top delegates by voting power
- Wallet required to change delegation; top delegates list is public

---

## Error Handling

| Scenario                   | Handling                                                     |
| -------------------------- | ------------------------------------------------------------ |
| The Graph unavailable      | Fall back to direct RPC reads; show degraded-mode banner     |
| Wrong network              | Modal prompt to switch to Base                               |
| Insufficient voting power  | Disabled vote/propose button with tooltip explanation        |
| Already voted              | Vote buttons replaced with "You voted [For/Against/Abstain]" |
| Transaction rejected       | Toast notification with error message                        |
| Transaction pending        | Optimistic UI + polling until confirmed                      |
| Proposal threshold not met | Inline warning on `/propose` at submission                   |

---

## Testing

### Unit Tests (Vitest)

- Subgraph AssemblyScript mapping handlers
- Proposal state derivation logic
- Calldata decoding utilities
- Vote weight calculation

### Integration Tests

- The Graph queries against local Graph Node (existing `docker/` infra)
- Contract interactions against a Base fork (Hardhat or Anvil)

### E2E Tests (Playwright)

- Proposal list loads and filters work
- Wallet connect flow (Privy)
- Vote casting flow (connected wallet, active proposal)
- Delegation change flow

---

## Key Contracts (Base)

| Contract     | Role                                        |
| ------------ | ------------------------------------------- |
| `UPGovernor` | Governance: propose, vote, queue, execute   |
| `UPToken`    | ERC20Votes: voting power, delegation        |
| `UPTimelock` | Timelock controller: 7-day delay on mainnet |

---

## Out of Scope

- UDT (legacy) governor support
- Cross-chain proposal execution UI (remains CLI-based)
- Tally API integration (avoided due to product-pivot uncertainty)
- Server-side caching layer (Cloudflare edge + The Graph is sufficient)
