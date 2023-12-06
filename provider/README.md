# Unlock RPC provider

This provider is a proxy application that connects to all networks supported by Unlock.

Even though this adds centralization (and effectively introduces a middleman), this is solely provided as a developer tool for convenience. Your application should use its own RPC endpoint in production.

For each network, the RPC endpoint URL is `https://rpc.unlock-protocol.com/<chainId>` (where `chainId` is the correct value for each network). You can use [Chainlist](https://chainlist.org/) to find these.

The Ethereum JSON RPC API specification [can be found there](https://github.com/ethereum/execution-apis).

# Development

You can use the `yarn wrangler` CLI (version 2) from Cloudflare to run locally with `yarn wrangler dev`.

To add support for a new network, just update `src/index.ts`

# Deployment

You can use the `yarn wrangler` CLI (version 2) from Cloudflare to deploy with `yarn wrangler publish`.

# Adding new networks

To add a new network, make sure you first add it to `supportedNetworks` and `types.ts` (you will need the new network's chain id), and then set the environment variable accordingly. (Adding to the `wrangler.toml` file would make it public...):

```bash
  yarn wrangler secret put <NETWORK NAME>_PROVIDER
```

And then type the provider address.

## TODO

- Only support RPC calls to Unlock contracts (or related contracts... such as ERC20 contracts).
- Deploy through Github action
- Measure all the things
- Rate limiting
