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

  return {
    supplier,
    purchaser,
  }
}
