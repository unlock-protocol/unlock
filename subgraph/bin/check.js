/**
 * Script to fetch our subgraph introspection graphql as JSON file. That
 * file (living at `introspection.json` at the root of this folder) is used
 * by the unlock-js lib to generate a graphql client.
 *
 * The introspection will happened against Goerli subgraph by default, but any
 * network can be used by setting `INTROSPECT_NETWORK` env (ex. INTROSPECT_NETWORK=100)
 */

const { networks } = require('@unlock-protocol/networks')
const { log } = require('./utils/logger')
const THE_GRAPH_URL = `https://api.thegraph.com/index-node/graphql`

const fetchGraph = async (query, url = THE_GRAPH_URL) => {
  const req = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  return await req.json()
}

const getLatestDeployment = async (url) => {
  const query = `{
    _meta{
      deployment
    }
  }`
  const { data } = await fetchGraph(query, url)
  if (!data._meta) console.log(data, url)
  const { deployment } = data._meta
  return deployment
}

const parseSubgraphType = ({ endpoint, studioEndpoint }) => {
  // custom if not the graph
  if (!endpoint.includes('thegraph')) return 'custom'
  if (
    // studioEndpoint ||
    (endpoint || '').includes('studio')
  )
    return 'studio'
  return 'hosted'
}

const checkHealth = async ({ id, name, subgraph }) => {
  const errors = []
  const subgraphType = parseSubgraphType(subgraph)
  if (subgraphType !== 'studio') {
    errors.push(`⚠️: Subgraph not migrated to studio (${subgraphType})`)
  }
  if (subgraphType === 'custom') {
    errors.push(`⚠️: Not hosted by The Graoh, couldn't fetch status.`)
    return
  }

  // get latest deployment id
  let deploymentId
  try {
    deploymentId = await getLatestDeployment(subgraph.endpoint)
  } catch (error) {
    errors.push(
      `❌ failed to fetch latest deployment from The Graph (${subgraph.endpoint})!`
    )
    errors.push(error)
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
    } = await fetchGraph(query)
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

  // log errors
  if (errors.length) {
    console.log(`${name} (${id}) -- ${subgraphType}`)
    console.log(errors.join('\n'))
    console.log(`------ \n`)
    log(
      `[SUBGRAPH] ${name} (${id}) -- ${subgraphType} - errors.join('\n')`,
      'error'
    )
  }
}

async function main() {
  const networksToCheck = Object.keys(networks).filter(
    (d) => !['31337'].includes(d)
  )
  console.log(
    `Fetching graph statuses for: ${networksToCheck.map(
      (id) => networks[id].name
    )}\n`
  )
  await Promise.all(
    networksToCheck.map(
      async (chainName) => await checkHealth(networks[chainName])
    )
  )
}

main()
  .then(() => console.log(`ok done.`))
  .catch((err) => console.error(err))
