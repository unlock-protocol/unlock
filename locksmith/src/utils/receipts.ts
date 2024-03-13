import { networks } from '@unlock-protocol/networks'
import { SubgraphService } from '@unlock-protocol/unlock-js'

export const getAllReceipts = async ({
  network,
  lockAddress,
}: {
  network: number
  lockAddress: string
}) => {
  const subgraph = new SubgraphService()
  const receipts: any[] = []
  const limit = 1000
  let skip = 0
  let more = true
  while (more) {
    const results = await subgraph.receipts(
      {
        where: {
          lockAddress: lockAddress.toLowerCase(),
        },
      },
      {
        networks: [network],
      }
    )
    if (results.length < limit) {
      more = false
    } else {
      skip += limit
    }
    receipts.push(...results)
  }
  return receipts
}
