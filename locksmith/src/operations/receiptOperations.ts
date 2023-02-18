import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Receipt, ReceiptBase } from '../models'

interface ReceiptDetailsProps {
  lockAddress: string
  network: number
  hash: string
}

export const getReceiptDetails = async ({
  lockAddress,
  network,
  hash,
}: ReceiptDetailsProps): Promise<{
  supplier: ReceiptBase | null
  purchaser: Receipt | null
  receipt: any
}> => {
  const purchaser = await Receipt.findOne({
    where: {
      network,
      lockAddress,
      hash,
    },
  })

  const supplier = await ReceiptBase.findOne({
    where: {
      lockAddress,
      network,
    },
  })

  // get receipts details from subgraph
  const subgraph = new SubgraphService()
  const receipt = await subgraph.receipt(
    {
      where: {
        id: hash,
      },
    },
    {
      network,
    }
  )

  return {
    supplier,
    purchaser,
    receipt,
  }
}
