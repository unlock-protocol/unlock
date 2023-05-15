const path = require('path')
const fs = require('fs-extra')
const { getIntrospectionQuery } = require('graphql')
const { networks } = require('@unlock-protocol/networks')

const introspectionJSONFilePath = path.join(
  __dirname,
  '..',
  'introspection.json'
)

const network = process.env.INTROSPECT_LOCALHOST ? '31337' : '5'
const endpoint = networks[network].subgraph.endpointV2

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
