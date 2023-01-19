import { Receipt, ReceiptBase } from '../models'

interface ReceiptDetailsProps {
  lockAddress: string
  network: number
  hash: string
}

interface PurchaseProps {
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

export const getPurchaserDetails = async ({
  lockAddress,
  network,
  hash,
}: PurchaseProps): Promise<Receipt | null> => {
  const receipt = await Receipt.findOne({
    where: {
      lockAddress,
      network,
      hash,
    },
  })
  return receipt
}
