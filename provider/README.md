# Unlock RPC provider

This provider is a proxy application that connects to all networks supported by Unlock.

Even though this adds centralization (and effectively introduces a middleman), this is solely provided as a developer tool for convenience. Your application should use its own RPC endpoint in production.

# Development

You can use the `wrangler` CLI (version 2) from Cloudflare to run locally with `wrangler dev`.

To add support for a new network, just update `src/index.ts`

# Deployment

You can use the `wrangler` CLI (version 2) from Cloudflare to run locally with `wrangler publish`.

## TODO

- Only support RPC calls to Unlock contracts (or related contracts... such as ERC20 contracts).
- Deploy through Github action
- Measure all the things
- Rate limiting
