# Unlock RPC provider

This provider is a proxy application that connects to all networks supported by Unlock.

Even though this adds centralization (and effectively introduces a middleman), this is solely provided as a developer tool for convenience. Your application should use its own RPC endpoint in production.

For each network, the RPC endpoint URL is `https://rpc.unlock-protocol.com/<chainId>` (where `chainId` is the correct value for each network). You can use [Chainlist](https://chainlist.org/) to find these.

The Ethereum JSON RPC API specification [can be found there](https://github.com/ethereum/execution-apis).

## Caching

The provider implements caching for ENS and BaseName resolution requests. These requests are cached to reduce load on the underlying RPC providers and improve performance.

The following types of requests are cached:

- ENS resolver lookups (`eth_call` to ENS resolver functions)
- Base name resolution (`eth_call` to L2 resolver functions)

Cache keys are based on the network ID, method, and parameters of the request.

### Cache Duration

By default, the cache duration is set to 1 hour (3600 seconds). This is configured in the `wrangler.toml` file:

```toml
[vars]
CACHE_DURATION_SECONDS = "3600"
```

To modify the cache duration, simply update this value in the wrangler.toml file:

- For a 30-minute cache: `CACHE_DURATION_SECONDS = "1800"`
- For a 2-hour cache: `CACHE_DURATION_SECONDS = "7200"`

If the environment variable contains an invalid value, the default 1-hour duration will be used.

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
