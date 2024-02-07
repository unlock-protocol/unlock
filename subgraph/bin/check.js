/**
 * Script to fetch our subgraph introspection graphql as JSON file. That
 * file (living at `introspection.json` at the root of this folder) is used
 * by the unlock-js lib to generate a graphql client.
 *
 * The introspection will happened against Goerli subgraph by default, but any
 * network can be used by setting `INTROSPECT_NETWORK` env (ex. INTROSPECT_NETWORK=100)
 */

const { networks } = require('@unlock-protocol/networks')

function parseSubgraphName({ endpoint, endpointv2, studioEndpoint }) {
  const end = endpointv2 || endpoint
  return end.includes('studio')
    ? studioEndpoint
    : `unlock-protocol/${end.split('/').pop()}`
}

async function checkHealth({ subgraph }) {
  console.log(subgraph)
  const subgraphName = parseSubgraphName(subgraph)
  console.log(subgraphName)
  console.log('\n')

  const query = `{
  indexingStatusForCurrentVersion(subgraphName: "${subgraphName}") {
    synced
    health
    fatalError {
      message
      block {
        number
        hash
      }
      handler
    }
    chains {
      chainHeadBlock {
        number
      }
      latestBlock {
        number
      }
    }
  }
}`

  const req = await fetch(`https://api.thegraph.com/index-node/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  const {
    data: { indexingStatusForCurrentVersion: resp },
  } = await req.json()

  if (resp)
    if (!resp.synced) {
      console.log(`Subgraph ${subgraphName} is out of sync!`)
    }
}

async function main() {
  await Promise.all(
    Object.keys(networks)
      .filter((d) => !['networks', 'default', 'localhost'].includes(d))
      .map((chainName) => checkHealth(networks[chainName]))
  )
}

main()
  .then(() => console.log(``))
  .catch((err) => console.error(err))
