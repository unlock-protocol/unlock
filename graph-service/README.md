# Graph Service

The Graph Service is a proxy for Unlock's Subgraphs. It encapsulates queries to subgraphs, handles authentication, and manages versions. The service supports multiple blockchain networks and their corresponding subgraphs.

## Features

- **Network-specific routing**: Routes requests to the appropriate subgraph based on the network.
- **GraphQL query forwarding**: Forwards GraphQL queries to the correct subgraph.
- **Error handling**: Manages errors for unsupported networks and invalid requests.
- **CORS support**: Ensures Cross-Origin Resource Sharing is handled correctly.
- **Environment-based configuration**: Configures different networks using environment variables.

## Development

To run the service locally:

```
yarn dev
```

This will start a local development server using Wrangler.

## Testing

Run the test suite using:

```
yarn test
```

The tests cover various scenarios including:

- Handling unsupported networks
- Rejecting non-POST requests
- Validating GraphQL queries
- Forwarding requests to the correct subgraph

## Deployment

To deploy the service to Cloudflare Workers:

```
yarn deploy
```

Ensure you have the necessary Cloudflare credentials set up before deploying.

## Usage

Send POST requests to `https://subgraph.unlock-protocol.com/{network}` with a JSON body containing a GraphQL query:

```json
{
  "query": "{ locks { address } }",
  "variables": {}
}
```

Replace `{network}` with one of the supported network names (e.g., `mainnet`, `optimism`, `polygon`, etc.).
