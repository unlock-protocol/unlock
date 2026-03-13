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
- **Framework:** Next.js 14 (App Router, `nodejs` runtime — NOT edge; Privy SDK requires Node.js APIs incompatible with Cloudflare's edge runtime)
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
id: ID!                    # on-chain proposalId as decimal string (uint256)
proposer: String!
description: String!
state: String!             # Pending | Active | Canceled | Defeated | Succeeded | Queued | Executed
forVotes: BigInt!
againstVotes: BigInt!
abstainVotes: BigInt!
snapshotTimestamp: BigInt! # timestamp at which voting power is snapshotted (from ProposalCreated event)
startTimestamp: BigInt!    # voting opens
endTimestamp: BigInt!      # voting closes
quorum: BigInt!            # quorum required at snapshot, fetched via Governor.quorum(snapshotTimestamp)
proposalThreshold: BigInt! # minimum voting power to propose, fetched via Governor.proposalThreshold()
targets: [String!]!
values: [BigInt!]!
calldatas: [Bytes!]!
createdAt: BigInt!
queuedAt: BigInt
executedAt: BigInt
canceledAt: BigInt
transactionHash: String!
votes: [Vote!]! @derivedFrom(field: "proposal")
```

**Vote**

```
id: ID!                  # "<proposalId (decimal string)>-<voterAddress (lowercase)>"
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
id: ID!                       # delegator address (lowercase)
delegatedTo: String!          # address this delegator has delegated to (address(0) = self-delegated)
votingPower: BigInt!          # current voting power (from DelegateVotesChanged)
tokenBalance: BigInt!         # current UP token balance (from Transfer events)
updatedAt: BigInt!
```

**DelegateSummary** (derived, for leaderboard)

```
id: ID!                       # delegate address (lowercase)
totalDelegatedPower: BigInt!  # sum of voting power delegated to this address
delegatorCount: Int!          # number of addresses delegating to this address
updatedAt: BigInt!
```

The `DelegateSummary` entity is updated on every `DelegateChanged` and `DelegateVotesChanged` event to maintain an up-to-date leaderboard without requiring reverse traversal of `Delegate` records.

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
- Each proposal card shows: title (first line of description), state badge, vote counts, quorum indicator (votes cast vs. quorum threshold), time remaining or end date
- Sorted by creation date descending
- Public (no wallet required)

### `/proposals/[id]` — Proposal Detail

- Full proposal description (markdown rendered)
- Vote breakdown: for / against / abstain bars with percentages and raw counts, quorum threshold line shown on bar
- Voting period info: voting delay and voting period duration displayed (sourced from `Governor.votingDelay()` and `Governor.votingPeriod()` via RPC on page load)
- **Proposal lifecycle timeline** — horizontal stepper showing all stages with timestamps (absolute + relative). Each stage is marked as completed, active, or pending:
  1. **Submitted** — block timestamp of `ProposalCreated` event
  2. **Voting opens** — `snapshotTimestamp + votingDelay`
  3. **Voting closed** — `endTimestamp`; annotated with outcome: "Passed", "Defeated", or "Quorum not reached"
  4. **Queued** — timestamp when `Governor.queue()` was called (from subgraph `queuedAt`); shows timelock expiry countdown
  5. **Executed** — timestamp when `Governor.execute()` was called (from subgraph `executedAt`)
- **Lifecycle action buttons** — one prominent action button shown per eligible state, visible to any connected wallet:
  - State `Succeeded` → **"Queue proposal"** button — calls `Governor.queue(targets, values, calldatas, descriptionHash)`; visible to all, not gated to proposer
  - State `Queued` + timelock expired → **"Execute proposal"** button — calls `Governor.execute(targets, values, calldatas, descriptionHash)`; disabled with countdown if timelock has not yet elapsed
  - State `Queued` + timelock not expired → disabled "Execute" button showing time remaining (e.g. "Executable in 3d 4h")
  - All other states → no action button
- **Outcome badge** — prominently displayed once voting closes: "Passed ✓", "Defeated ✗", "Quorum not reached", "Canceled", or "Executed ✓"
- Decoded calldata: show target contract, function name, and arguments in human-readable form (ABI sourced from `@unlock-protocol/contracts` package; unknown contracts shown as raw hex)
- Proposal threshold displayed: minimum voting power required to have submitted this proposal
- **Cast vote UI**: For / Against / Abstain buttons + optional reason field
  - Requires connected wallet
  - Shows user's voting power at the proposal's `snapshotTimestamp` (via `Governor.getVotes(address, snapshotTimestamp)`)
  - Disabled if already voted, voting not active, or no voting power
  - Replaced by "You voted For / Against / Abstain" label if user has already voted
- Public browsing, wallet required to vote or trigger lifecycle actions

### `/propose` — Create Proposal

- **Simple mode (default tab):**
  - Title field (becomes first line of description)
  - Description field (markdown, full proposal body)
  - Add target calls: contract address, function signature, arguments, ETH value
  - Multiple calls supported (add/remove)
- **Advanced mode (second tab):**
  - JSON editor accepting a browser-safe subset of the CLI proposal format:
    ```json
    {
      "proposalName": "...",
      "calls": [
        {
          "contractAbi": [...],
          "contractAddress": "0x...",
          "functionName": "...",
          "functionArgs": []
        }
      ]
    }
    ```
  - `contractAbi` must be an inline ABI array (JSON). The CLI's `contractNameOrAbi` string form (package import) is not supported in the browser. The UI shows a clear error if a string is provided instead of an array.
  - Validated on parse (ABI validity, address checksum, function existence in ABI) before submission
- Proposal threshold check on submit: show user's current voting power vs. required threshold; block submission if insufficient
- Wallet required to submit; browsing and drafting are open to all

### `/delegate` — Delegation

- Shows user's UP token balance and current voting power
- Shows current delegate address; if `address(0)` is returned from the contract, display as "Self" (OpenZeppelin ERC20Votes returns `address(0)` for undelegated accounts — these have no voting power; users must explicitly delegate to themselves or another address to activate voting power)
- Change delegate: ENS/address input + confirm transaction. Entering own address = self-delegate.
- Leaderboard section: top delegates by total delegated voting power (sourced from `DelegateSummary` entities)
- Wallet required to change delegation; leaderboard and delegate profiles are public

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
| Timelock not yet elapsed   | Execute button disabled with countdown; no action possible   |
| Proposal already queued    | Queue button hidden; cannot queue twice                      |
| Proposal already executed  | Execute button hidden; show executed timestamp               |

---

## Testing

### Unit Tests (Vitest)

- Proposal state derivation logic (client-side RPC fallback path)
- Calldata decoding utilities
- Vote weight calculation
- JSON proposal format validation

### Subgraph Tests (matchstick-as)

AssemblyScript mapping handlers are tested with `matchstick-as` (The Graph's native testing framework), not Vitest. Tests cover:

- `ProposalCreated` → correct Proposal entity creation
- `VoteCast` → correct Vote entity and Proposal vote count update
- `DelegateChanged` / `DelegateVotesChanged` → correct Delegate and DelegateSummary updates

### Integration Tests

- The Graph queries against local Graph Node (existing `docker/` infra)
- Contract interactions against a Base fork (Hardhat or Anvil)

### E2E Tests (Playwright)

- Proposal list loads and filters work
- Wallet connect flow (Privy)
- Vote casting flow (connected wallet, active proposal)
- Delegation change flow

---

## Key Contracts (Base Mainnet, Chain ID 8453)

| Contract     | Address                                      | Role                                      |
| ------------ | -------------------------------------------- | ----------------------------------------- |
| `UPGovernor` | `0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9` | Governance: propose, vote, queue, execute |
| `UPToken`    | `0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187` | ERC20Votes: voting power, delegation      |
| `UPTimelock` | `0xB34567C4cA697b39F72e1a8478f285329A98ed1b` | Timelock controller: 7-day delay          |

ABIs are available in `@unlock-protocol/contracts` (exported as `UPGovernor`, `UPToken`, `UPTimelock`). Addresses are also available at runtime via `@unlock-protocol/networks` (`base.dao.governor`, `base.dao.timelock`, `base.dao.token`).

**Base Sepolia (testnet, Chain ID 84532):**

- UPGovernor: `0xfdbe81e89fcaa4e7b47d62a25636cc158f07aa0d`

---

## RPC Fallback: Live Proposal State

When The Graph is unavailable, the app falls back to reading proposal state directly from the Governor contract via viem. The fallback path:

1. Call `Governor.state(proposalId)` — returns a `uint8` enum (0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 5=Queued, 7=Executed)
2. Call `Governor.proposalVotes(proposalId)` — returns `(againstVotes, forVotes, abstainVotes)`
3. Call `Governor.proposalSnapshot(proposalId)` and `Governor.proposalDeadline(proposalId)` — for timeline
4. Call `Governor.quorum(snapshotTimestamp)` — for quorum display

The degraded-mode banner is shown when any The Graph query fails.

---

## Out of Scope

- UDT (legacy) governor support — historical UDT proposals remain viewable on Tally (Tally's UI may go away but the data remains on-chain)
- Cross-chain proposal execution UI (remains CLI-based via `governance/` scripts)
- Tally API integration (avoided due to product-pivot uncertainty)
- Server-side caching layer (Cloudflare edge + The Graph is sufficient)
- URL redirects from old Tally links (Tally stays live for UDT history; no redirect needed)
