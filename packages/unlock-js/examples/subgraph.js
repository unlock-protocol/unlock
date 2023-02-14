const { SubgraphService } = require('..')

async function main() {
  const service = new SubgraphService()
  const locks = await service.locks(
    {
      first: 100,
      skip: 100,
    },
    {
      networks: [1, 5],
    }
  )
  console.log(locks)

  const keys = await service.locks(
    {
      first: 100,
      skip: 100,
    },
    {
      networks: [1, 5],
    }
  )
  console.log(keys)
}

main().catch(console.error)
