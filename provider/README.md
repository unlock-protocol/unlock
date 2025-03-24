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
3. **KV Storage**: Durable storage (1-year TTL) that persists across worker restarts (see [KV Namespaces setup](#kv-namespaces) below)

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

## Batch Request Processing

The provider supports optimized batch request processing. When a batch of RPC requests is received, the provider:

1. Unbundles the batch into individual requests
2. Processes each request appropriately:
   - Handles locally if possible (e.g., `eth_chainId`, cached ENS/Basename requests)
   - Applies rate limiting checks to each request
3. Only forwards necessary requests to the underlying RPC provider
4. Recombines all responses (both locally processed and provider-processed) into a single batch response

This optimization reduces load on the underlying RPC providers and improves performance for batch requests that include requests that can be handled locally.

### Example

For a batch request containing:

- An `eth_chainId` request
- An ENS resolution request (that's in cache)
- A contract call that needs to be forwarded

The provider will:

1. Process the `eth_chainId` request locally
2. Retrieve the ENS resolution from cache
3. Forward only the contract call to the RPC provider
4. Combine all three responses and return them in the original order

# Development

You can use the `yarn dev` to run locally.

# Deployment

You can use the `yarn deploy` to deploy to Cloudflare.

# KV Namespaces

As mentioned in the [Lock Caching Optimizations](#lock-caching-optimizations) section, the provider uses Cloudflare KV (Key-Value) namespaces for durable storage of lock data. This is the third tier of our caching system that persists data across worker restarts with a 1-year TTL.

To set up the required KV namespace:

1. Create a new KV namespace:

```bash
npx wrangler kv:namespace create ALLOWED_CONTRACTS
```

2. This will output an ID that you need to add to your `wrangler.toml` file:

```toml
[[kv_namespaces]]
binding = "ALLOWED_CONTRACTS"
id = "your-kv-namespace-id"
```

3. For local development, you'll also need a preview ID:

```bash
npx wrangler kv:namespace create ALLOWED_CONTRACTS --preview
```

4. Add the preview ID to your wrangler.toml:

```toml
[[kv_namespaces]]
binding = "ALLOWED_CONTRACTS"
id = "your-kv-namespace-id"
preview_id = "your-preview-id"
```

# Adding new networks

To add a new network, make sure you first add it to `supportedNetworks` and `types.ts` (you will need the new network's chain id), as well as in `.op.env` and `set-env-vars.sh`.

Then set it in 1Password, under `secrets/rpc-providers`.

```bash
  yarn run set-env-vars
```

## TODO

- Deploy through Github action
- Measure all the things
