# Unlock RPC provider

This provider is a proxy application that connects to all networks supported by Unlock.
TODO: only support RPC calls to Unlock contracts (or related contracts... such as ERC20 contracts).

Even though this adds centralization (and effectively introduces a middleman), this is solely provided as a developer tool for convenience. Your application should use its own RPC endpoint in production.

# Development

You can use the `wrangler` CLI (version 2) from Cloudflare to run locally with `wrangler dev`.

# Deployment

You can use the `wrangler` CLI (version 2) from Cloudflare to run locally with `wrangler publish`.
