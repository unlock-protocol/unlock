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
      Authorization: `Bearer ${process.env.SUBGRAPH_QUERY_API_KEY}`,
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

const getGraphId = async (chainId) => {
  const url = `https://subgraph.unlock-protocol.com/${chainId}`
  const response = await fetch(url, {
    // prevent redirect
    redirect: 'manual',
  })
  const { graphId } = await response.json()
  return graphId
}

const checkHealth = async ({ id, name, subgraph }) => {
  const errors = []

  const graphId = await getGraphId(id)
  const subgraphUrl = `https://gateway.thegraph.com/api/subgraphs/id/${graphId}`

  // get latest deployment id
  let deploymentId
  try {
    deploymentId = await getLatestDeployment(subgraphUrl)
  } catch (error) {
    errors.push(
      `❌ failed to fetch latest deployment from The Graph (${subgraphUrl})!`
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
    console.log(`${name} (${id})`)
    console.log(errors.join('\n'))
    console.log(`------ \n`)
    log(`[SUBGRAPH] ${name} (${id})  - ${errors.join('\n')}`, 'error')
  }
  return errors
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

  let hasErrors = false
  const results = await Promise.all(
    networksToCheck.map(async (chainName) => {
      const errors = await checkHealth(networks[chainName])
      console.log(errors)
      if (errors.length > 0) {
        hasErrors = true
      }
      return errors
    })
  )

  if (hasErrors) {
    process.exit(1)
  }
}

main()
  .then(() => console.log(`ok done.`))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
