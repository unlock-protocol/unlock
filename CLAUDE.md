# Unlock Protocol Monorepo

Unlock is a decentralized membership/subscription protocol on EVM blockchains. NFT-based access control: **Locks** are smart contracts, **Keys** are NFTs granting membership.

## Monorepo Structure

Yarn 4.10.3 workspaces, Node >= 20 required, TypeScript throughout.

**Applications:**
- `unlock-app/` — Main dashboard (Next.js 14, Privy auth, ethers.js v6, React Query, Tailwind)
- `locksmith/` — Backend API (Express 5, Sequelize/Postgres, Graphile Worker jobs)
- `governance-app/` — DAO governance UI
- `wedlocks/` — Email service (Cloudflare Worker, Handlebars)
- `paywall-app/` — Embeddable paywall widget (Next.js, static export)
- `provider/` — RPC proxy (Cloudflare Worker, multi-chain rate limiting)
- `unlock-protocol-com/` — Marketing site (Docusaurus)

**Core:**
- `smart-contracts/` — Solidity (Hardhat, OpenZeppelin upgradeable proxies)
- `subgraph/` — The Graph indexer (AssemblyScript, GraphQL)
- `governance/` — DAO tooling (proposals, voting, cross-chain)
- `packages/` — 14 shared npm packages (networks, ui, unlock-js, contracts, etc.)

## Essential Commands

```bash
yarn                                             # Install all deps
yarn build                                       # Full monorepo build
yarn packages:build                              # Shared packages only (topological order)
yarn workspace @unlock-protocol/<name> <cmd>     # Run command in specific workspace
yarn start                                       # Start Docker infra + all apps
yarn start:infra                                 # Docker only (Postgres, Graph Node, IPFS)
yarn stop / yarn nuke                            # Stop / destroy infrastructure
yarn lint                                        # ESLint all packages
yarn lint:contracts                              # Solhint for Solidity
```

## Testing

Each workspace has its own test setup — always run tests from the workspace directory:

```bash
# Smart contracts (Hardhat/Mocha)
cd smart-contracts && yarn test

# Backend (Vitest + Supertest, requires Postgres)
cd locksmith && yarn test

# Frontend (Vitest/jsdom)
cd unlock-app && yarn test

# Subgraph (Matchstick)
cd subgraph && yarn test
```

**Practice TDD**: write tests first, minimal code to pass, refactor while green.

## Code Style

- **Prettier**: no semicolons, single quotes, trailing commas (es5)
- **Solidity**: 80 col, double quotes, no bracket spacing (via prettier-plugin-solidity)
- **ESLint 9**: shared config from `packages/eslint-config`
- Pre-commit: lint-staged runs prettier + eslint on staged files
- Pre-push: ESLint on changed JS files since `origin/master`
- **Never use `--no-verify`**

## Architecture Notes

- **Upgradeable Proxies**: Unlock (factory) deploys PublicLock (template) via TransparentUpgradeableProxy
- **Mixin Pattern**: PublicLock is composed of ~13 mixins (MixinPurchase, MixinKeys, MixinRoles, etc.)
- **Hook System**: 10 extensible hooks (purchase, transfer, extend, cancel, etc.) for custom logic
- **Multi-version**: Multiple PublicLock versions can be deployed simultaneously
- **Current versions**: Unlock v14, PublicLock v15
- **Next.js pinned**: `"next": "14.2.35"` in root `resolutions` — do not upgrade without discussion

## Key Tokens

- **UDT** (Unlock Discount Token) — Legacy governance token
- **UP** (UPToken) — New governance token (UDT→UP swap available)

## Supported Networks

Mainnet, Optimism, BSC, Gnosis, Polygon, zkSync, zkEVM, Arbitrum, Celo, Avalanche, Base, Sepolia, Base Sepolia, Linea, Scroll (15+ total). Network config lives in `packages/networks`.

## CI/CD

- PRs: conditional testing based on changed files, preview deploys to Vercel
- `master`: auto-deploys to staging (Railway for locksmith, Vercel for frontends)
- Production: explicit promotion via separate PR/approval
- Secrets via 1Password service account (`op://vault/item/field` syntax)

## PR Workflow

- Never merge directly — always go through PR review
- After pushing, check CI status and iterate on failures automatically
- Claude Code Review runs on every PR and posts inline comments for issues
