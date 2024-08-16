const { networks } = require('@unlock-protocol/networks')

const fetchFromSubgraph = async ({ chainId, query }) => {
  const { subgraph } = networks[chainId]

  if (!subgraph || !subgraph.endpoint) {
    console.log(
      'Missing subGraphURI for this network. Can not fetch from The Graph'
    )
    return []
  }

  const q = await fetch(subgraph.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
    }),
  })

  const { data, errors } = await q.json()
  if (errors) {
    console.log('SUBGRAPH > [Error] while fetching the graph', errors)
    return []
  }
  return data
}

module.exports = {
  fetchFromSubgraph,
}
