import { getBuiltGraphSDK } from '../@generated/subgraph'

async function main() {
  const client = getBuiltGraphSDK()
  const locks = await client.getLocks(
    {},
    {
      network: 'polygon-v2',
    }
  )
  console.log(locks)
}

main()
