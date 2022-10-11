const { CreateSubgraphService } = require('..')

async function main() {
  const sdk = CreateSubgraphService()
  const { allLocks } = await sdk.getLocks({
    first: 100,
    skip: 100,
    networks: ['gnosis-v2', 'polygon-v2'],
  })
  console.table(allLocks)
}

main().catch(console.error)
