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

## Lock Caching Optimizations

The provider uses a three-tier caching system for lock addresses to minimize blockchain calls:

1. **In-Memory Cache**: Unlimited-size, fast lookup storage that persists during worker runtime
2. **Cache API**: Edge-distributed cache with 24-hour TTL for frequently accessed locks
3. **KV Storage**: Durable storage (1-year TTL) that persists across worker restarts

**Key Features**:

- Automatic prefilling of memory cache on first request
- Non-blocking async operations to maintain performance
- Access pattern tracking for analytics
- No scheduled tasks required - optimized for standard worker environments

## Rate Limiting

The provider implements rate limiting to ensure fair usage of the service:

- 10 requests per 10 seconds per IP address/contract
- 1000 requests per hour per IP address

### Locksmith Authentication

Requests from Locksmith are exempt from rate limiting.

1. Locksmith appends a secret key to requests: `?secret=YOUR_SECRET_KEY`
2. Requests with a valid secret key bypass all rate limiting

### Unlock Contract Exemptions

Rate limiting can be configured in `wrangler.toml`:

```toml
[vars]
REQUESTS_PER_SECOND = "10"         # Default: 10
REQUESTS_PER_HOUR = "1000"         # Default: 1000
```

# Development

You can use the `yarn dev` to run locally.

# Deployment

You can use the `yarn deploy` to deploy to Cloudflare.

# Adding new networks

To add a new network, make sure you first add it to `supportedNetworks` and `types.ts` (you will need the new network's chain id), as well as in `.op.env` and `set-env-vars.sh`.

Then set it in 1Password, under `secrets/rpc-providers`.

```bash
  yarn run set-env-vars
```

## TODO

- Deploy through Github action
- Measure all the things
