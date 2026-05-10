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

React Query manages caching (stale-while-revalidate, 30s TTL). If The Graph is unavailable, a degraded-mode banner is shown. The fallback is page-specific:

| Page              | Degraded mode behaviour                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `/proposals/[id]` | Fully functional — state, votes, timeline, and lifecycle actions via RPC           |
| `/treasury`       | Fully functional — all balances via RPC                                            |
| `/delegate`       | Fully functional — personal delegation status via RPC                              |
| `/`               | Shows error state for aggregates/recent-proposals section; token stats unavailable |
| `/proposals`      | Shows error state — proposal history requires subgraph                             |
| `/delegates`      | Shows error state — leaderboard requires subgraph                                  |

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
id: ID!                     # on-chain proposalId as decimal string (uint256)
proposer: String!
description: String!
# Event-driven flags only — do NOT store a `state` string.
# Time-based states (Pending, Active, Succeeded, Defeated) drift between
# events and cannot be kept current by event handlers alone.
# Clients derive the current state from the fields below at query time.
#
# UPGovernor uses GovernorTimelockControlUpgradeable — `Expired` is NOT a
# reachable state (that variant only exists in GovernorTimelockAccess).
# Quorum failure maps to Defeated, not Expired.
#
# UPGovernor uses GovernorCountingSimpleUpgradeable with COUNTING_MODE
# "support=bravo&quorum=for,abstain":
#   - quorum check: forVotes + abstainVotes >= quorum
#   - victory check: forVotes > againstVotes
# Both must pass for Succeeded; either failure → Defeated.
#
# Derivation order (check top-to-bottom, stop at first match):
#   canceledAt set                          → Canceled
#   executedAt set                          → Executed
#   etaSeconds set                          → Queued (executable when block.timestamp >= etaSeconds)
#   now < voteStartTimestamp                → Pending
#   now <= voteEndTimestamp                 → Active
#   forVotes > againstVotes
#     AND forVotes + abstainVotes >= quorum → Succeeded
#   otherwise                               → Defeated
forVotes: BigInt!
againstVotes: BigInt!
abstainVotes: BigInt!
voteStartTimestamp: BigInt!  # from ProposalCreated.voteStart; also the voting-power snapshot point
voteEndTimestamp: BigInt!    # from ProposalCreated.voteEnd
createdAtTimestamp: BigInt!  # block timestamp of ProposalCreated (before voting delay)
quorum: BigInt!              # from Governor.quorum(voteStartTimestamp) at index time
proposalThreshold: BigInt!   # from Governor.proposalThreshold() at index time
targets: [String!]!
values: [BigInt!]!
calldatas: [Bytes!]!
etaSeconds: BigInt           # from ProposalQueued.etaSeconds — timestamp when proposal becomes executable
executedAt: BigInt           # block timestamp of ProposalExecuted
canceledAt: BigInt           # block timestamp of ProposalCanceled
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
delegatedTo: String!          # address this delegator has delegated to; address(0) means not yet delegated (no voting power active); self-delegation is when delegatedTo == id
votingPower: BigInt!          # current voting power (from DelegateVotesChanged)
tokenBalance: BigInt!         # current UP token balance (from Transfer events)
updatedAt: BigInt!
```

**DelegateSummary** (derived, for leaderboard)

```
id: ID!                       # delegate address (lowercase)
totalDelegatedPower: BigInt!  # sum of voting power delegated to this address
delegatorCount: Int!          # number of addresses delegating to this address
proposalsVoted: Int!          # total number of proposals this delegate has voted on (incremented on VoteCast)
updatedAt: BigInt!
```

The `DelegateSummary` entity is updated on every `DelegateChanged`, `DelegateVotesChanged`, `VoteCast`, and `VoteCastWithParams` event. `proposalsVoted` is incremented whenever either `VoteCast` or `VoteCastWithParams` is emitted where `voter == id`. The delegates leaderboard shows `proposalsVoted` as the participation metric (not a rate, since total proposal count requires a separate query — simpler to show raw count).

### New Event Handlers

**UPGovernor contract (Base):**

- `ProposalCreated` → create Proposal entity
- `VoteCast` / `VoteCastWithParams` → create Vote entity, update Proposal vote counts
- `ProposalQueued` → set `Proposal.etaSeconds` from event param
- `ProposalExecuted` → set `Proposal.executedAt`
- `ProposalCanceled` → set `Proposal.canceledAt`

**UPToken contract (Base):**

- `DelegateChanged` → update Delegate.delegatedTo
- `DelegateVotesChanged` → update Delegate.votingPower
- `Transfer` → update Delegate.tokenBalance (for from and to addresses)

---

## Pages & Features

### `/` — DAO Home

Overview dashboard, equivalent to https://www.tally.xyz/gov/unlock-protocol.

- **DAO header**: name ("Unlock DAO"), description, links to unlock-protocol.com and social
- **Key stats bar**: token symbol (UP), quorum (3,000,000 UP), total proposals (count of `Proposal` entities), voting period duration — token holder count is excluded from initial scope (requires a subgraph aggregate not in the current schema)
- **Recent proposals**: last 5 proposals with state badge, title, and vote summary — links to `/proposals` for full list
- **Delegates snapshot**: top 3 delegates by voting power — links to `/delegates` for full list
- **Treasury snapshot**: ETH + UP balance of the timelock address — links to `/treasury` for full breakdown
- **"New proposal" button** linking to `/propose`
- Public (no wallet required)

### `/proposals` — Proposals List

Equivalent to https://www.tally.xyz/gov/unlock-protocol/proposals.

- Tabbed filter: All | Active | Pending | Succeeded | Queued | Defeated | Executed | Canceled
- Each proposal card shows: title (first line of description), state badge, proposer address (truncated), for/against/abstain vote counts, quorum indicator (`forVotes + abstainVotes` vs quorum threshold), time remaining or end date
- Sorted by creation date descending
- "New proposal" button linking to `/propose`
- Public (no wallet required)

### `/proposals/[id]` — Proposal Detail

- Full proposal description (markdown rendered)
- Vote breakdown: for / against / abstain bars with percentages and raw counts; quorum threshold line shown against `forVotes + abstainVotes` (per `COUNTING_MODE=quorum:for,abstain`)
- Voting period info: voting delay and voting period duration displayed (sourced from `Governor.votingDelay()` and `Governor.votingPeriod()` via RPC on page load)
- **Proposal lifecycle timeline** — horizontal stepper showing all stages with timestamps (absolute + relative). Each stage is marked as completed, active, or pending:
  1. **Submitted** — `createdAtTimestamp` (block timestamp of `ProposalCreated` event, before voting delay)
  2. **Voting opens** — `voteStartTimestamp` (from `ProposalCreated.voteStart`; also the snapshot point for voting power)
  3. **Voting closed** — `voteEndTimestamp`; annotated with outcome: "Passed" or "Defeated" (quorum not reached shown as a sub-label: "Defeated — quorum not reached")
  4. **Queued** — `etaSeconds` from `ProposalQueued` event; shows countdown to execution eligibility ("Executable in 3d 4h" or "Executable now")
  5. **Executed** — `executedAt` block timestamp
- **Lifecycle action buttons** — one prominent action button shown per eligible state, visible to any connected wallet:
  - State `Succeeded` → **"Queue proposal"** button — calls `Governor.queue(targets, values, calldatas, descriptionHash)`; visible to all, not gated to proposer
  - State `Queued` + `block.timestamp >= etaSeconds` → **"Execute proposal"** button — calls `Governor.execute(targets, values, calldatas, descriptionHash)`
  - State `Queued` + `block.timestamp < etaSeconds` → disabled "Execute" button showing countdown to `etaSeconds` (e.g. "Executable in 3d 4h")
  - All other states → no action button
- **Outcome badge** — prominently displayed once voting closes: "Passed ✓", "Defeated ✗" (with sub-label "quorum not reached" if applicable), "Canceled", or "Executed ✓"
- Decoded calldata: show target contract, function name, and arguments in human-readable form (ABI sourced from `@unlock-protocol/contracts` package; unknown contracts shown as raw hex)
- Proposal threshold displayed: minimum voting power required to have submitted this proposal
- **Cast vote UI**: For / Against / Abstain buttons + optional reason field
  - Requires connected wallet
  - Shows user's voting power at the proposal's `voteStartTimestamp` (via `Governor.getVotes(address, voteStartTimestamp)`)
  - Disabled if already voted, voting not active, or no voting power
  - Replaced by "You voted For / Against / Abstain" label if user has already voted
- Public browsing, wallet required to vote or trigger lifecycle actions

### `/propose` — Create Proposal

- **Simple mode (default tab):**
  - Title field (becomes first line of description)
  - Description field (markdown, full proposal body)
  - Add target calls — each call has:
    - **Contract**: dropdown of known protocol contracts (those exported from `@unlock-protocol/contracts`: `UPGovernor`, `UPToken`, `UPTimelock`, `Unlock`, `PublicLock`) plus a "Custom contract" option
    - Known contracts: function dropdown populated from their ABI (bundled at build time from `@unlock-protocol/contracts`)
    - Custom contract: address field + inline ABI paste (same as advanced mode per-call)
    - Arguments: typed inputs derived from the selected function's ABI
    - ETH value: optional
  - Multiple calls supported (add/remove)
  - MVP scope: the known-contract dropdown covers the most common governance actions (protocol upgrades, parameter changes, token transfers from timelock). Arbitrary contracts require advanced mode.
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

### `/delegates` — Delegates List

Equivalent to https://www.tally.xyz/gov/unlock-protocol/delegates.

- Full leaderboard of all delegates sorted by total delegated voting power (sourced from `DelegateSummary` entities)
- Each row: rank, address (ENS resolved if available), voting power, % of total supply delegated, number of delegators, proposals voted on (raw count from `DelegateSummary.proposalsVoted`)
- Search by address or ENS
- **"Delegate to me" / "Delegate" button** for connected wallet — calls `UPToken.delegate(address)`
- Connected wallet's own delegation status shown at top if wallet is connected (current delegate, own voting power)
- Public; wallet required to change delegation

### `/treasury` — Treasury

Equivalent to https://www.tally.xyz/gov/unlock-protocol/treasury.

- Displays token balances held by the UPTimelock contract (`0xB34567C4cA697b39F72e1a8478f285329A98ed1b`)
- **ETH balance** — via `provider.getBalance(timelockAddress)`
- **UP token balance** — via `UPToken.balanceOf(timelockAddress)`
- **Other ERC20 balances** — check balances for the curated token list from `@unlock-protocol/networks`; show any with non-zero balance. This is a **known-token allowlist view**, not a complete inventory — arbitrary ERC20s transferred to the timelock that are not in the network token list will not appear. Unknown holdings can be discovered manually via a block explorer link to the timelock address (provided on the page).
- No USD conversion — raw token amounts only
- Public (no wallet required)
- Note: treasury data is fetched live via RPC on each page load; no subgraph indexing needed

### `/delegate` — Personal Delegation

- Shows connected user's UP token balance, current voting power, and current delegate
- If `address(0)` is returned, display as "Not delegated" with a warning: voting power is inactive until delegated (even to self)
- Change delegate: ENS/address input + confirm `UPToken.delegate()` transaction. Entering own address = self-delegate.
- Wallet required; redirects to connect wallet if not connected

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

1. Call `Governor.state(proposalId)` — returns a `uint8` enum (0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 5=Queued, 7=Executed). Note: `6=Expired` is defined in the OZ enum but is not reachable via `UPGovernor` (`GovernorTimelockControlUpgradeable` does not use it); handle defensively but do not surface in UI.
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
