const THE_GRAPH_URL = `https://api.thegraph.com/index-node/graphql`

export const queryGraph = async ({
  subgraphEndpoint = THE_GRAPH_URL,
  query,
}) => {
  if (!subgraphEndpoint) {
    throw new Error(
      'Missing subGraphURI for this network. Can not fetch from The Graph'
    )
  }

  const req = await fetch(subgraphEndpoint, {
    body: JSON.stringify({ query }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const { data, errors } = await req.json()
  if (errors) {
    console.error(
      `LOCK > Error while fetching the graph: ${subgraphEndpoint}`,
      errors
    )
  }

  return { data, success: !!errors }
}

const getLatestSubgraphDeployment = async (subgraphEndpoint) => {
  const query = `{
    _meta{
      deployment
    }
  }`
  const { data } = await queryGraph({ query, subgraphEndpoint })
  // TODO: handle missing data
  if (!data._meta) console.log(data, subgraphEndpoint)
  const { deployment } = data._meta
  return deployment
}

export const checkSubgraphHealth = async (subgraphEndpoint: string) => {
  const errors: string[] = []
  // get latest deployment id
  let deploymentId
  try {
    deploymentId = await getLatestSubgraphDeployment(subgraphEndpoint)
  } catch (error) {
    errors.push(
      `❌ failed to fetch latest deployment from The Graph (${subgraphEndpoint})! (${error})`
    )
    return errors
  }

  let status
  if (deploymentId) {
    const query = `{
      indexingStatuses(subgraphs: ["${deploymentId}"]) {
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
          network
        }
      }
    }`

    const {
      data: { indexingStatuses },
    } = await queryGraph({ query })
    ;[status] = indexingStatuses
  }

  // parse errors
  if (status) {
    if (!status.synced) {
      errors.push(`❌ Subgraph is out of sync!`)
    }
    if (status.health !== 'healthy') {
      errors.push(`❌ Subgraph is failing: ${status.fatalError?.message}`)
    }
  } else {
    errors.push(`⚠️: Missing health status for subgraph `)
  }

  return errors
}
