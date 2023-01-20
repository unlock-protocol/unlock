import { ReceiptBase } from '../models'

export const getSupplier = async (
  lockAddress: string,
  network: number
): Promise<ReceiptBase | null> => {
  const receipt = await ReceiptBase.findOne({
    where: {
      lockAddress,
      network,
    },
  })
  return receipt
}
