/**
 * Script to fetch our subgraph introspection graphql as JSON file. That
 * file (living at `introspection.json` at the root of this folder) is used
 * by the unlock-js lib to generate a graphql client.
 *
 * The introspection will happened against Goerli subgraph by default, but any
 * network can be used by setting `INTROSPECT_NETWORK` env (ex. INTROSPECT_NETWORK=100)
 */

const path = require('path')
const fs = require('fs-extra')
const { getIntrospectionQuery } = require('graphql')
const { networks } = require('@unlock-protocol/networks')

const introspectionJSONFilePath = path.join(
  __dirname,
  '..',
  'introspection.json'
)

const network = process.env.INTROSPECT_NETWORK || '1'
const endpoint = networks[network].subgraph.endpoint

console.log(`Fetching graphql introspection from ${endpoint}`)
async function main() {
  const query = getIntrospectionQuery()
  const req = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  const json = JSON.parse(await req.text())
  await fs.writeJSON(introspectionJSONFilePath, json, { spaces: 2 })
}

main()
  .then(() => console.log(`Saved at ${introspectionJSONFilePath}`))
  .catch((err) => console.error(err))
