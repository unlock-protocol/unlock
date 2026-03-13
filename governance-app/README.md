# Governance App

This workspace contains the Unlock DAO governance app scaffold.

## Run locally

From the repo root:

```bash
yarn install
yarn workspace @unlock-protocol/governance-app dev
```

The app runs on `http://localhost:3000` by default.

## Environment

Wallet authentication is optional in the current scaffold. To enable Privy locally, set:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

If `NEXT_PUBLIC_PRIVY_APP_ID` is not set, the app still runs and the wallet provider is skipped.

## Useful commands

```bash
yarn workspace @unlock-protocol/governance-app lint .
yarn workspace @unlock-protocol/governance-app build
yarn workspace @unlock-protocol/governance-app start
```

## Current routes

- `/`
- `/proposals`
- `/proposals/[id]`
- `/propose`
- `/delegates`
- `/delegate`
- `/treasury`
