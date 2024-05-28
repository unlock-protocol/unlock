# Unlock RPC provider

This provider is a proxy application that connects to all networks supported by Unlock.

Even though this adds centralization (and effectively introduces a middleman), this is solely provided as a developer tool for convenience. Your application should use its own RPC endpoint in production.

For each network, the RPC endpoint URL is `https://rpc.unlock-protocol.com/<chainId>` (where `chainId` is the correct value for each network). You can use [Chainlist](https://chainlist.org/) to find these.

The Ethereum JSON RPC API specification [can be found there](https://github.com/ethereum/execution-apis).

# Development

You can use the `yarn dev` to run locally.

# Deployment

You can use the `yarn deploy` to deploy to Cloudflare.

# Adding new networks

To add a new network, make sure you first add it to `supportedNetworks` and `types.ts` (you will need the new network's chain id), as well as in `.op.env` and `set-provider-urls.sh`.

Then set it in 1Password, under `secrets/rpc-providers`.

```bash
  yarn run set-provider-urls
```

## TODO

- Only support RPC calls to Unlock contracts (or related contracts... such as ERC20 contracts).
- Deploy through Github action
- Measure all the things
- Rate limiting
