import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Receipt, ReceiptBase } from '../models'
import { getMetadataByTokenId } from './userMetadataOperations'

interface ReceiptDetailsProps {
  lockAddress: string
  network: number
  hash: string
  tokenId?: string
}

/**Get purchaser details from receipt or returns purchaser with metadata values */
const getPurchaserDetails = async ({
  lockAddress,
  network,
  hash,
  tokenId,
}: ReceiptDetailsProps): Promise<Partial<Receipt> | null> => {
  const receiptPurchaser = await Receipt.findOne({
    where: {
      network,
      lockAddress,
      hash,
    },
  })

  let metadata: any
  if (tokenId) {
    metadata = await getMetadataByTokenId({
      tokenId,
      network,
      lockAddress,
      includeProtected: true,
    })
  }

  const data = metadata?.userMetadata?.protected ?? {}

  // use purchaser details as default or metadata if not present
  const businessName = receiptPurchaser?.businessName || data?.businessName
  const city = receiptPurchaser?.city || data?.city
  const zip = receiptPurchaser?.zip || data?.zip
  const state = receiptPurchaser?.state || data?.state
  const country = receiptPurchaser?.country || data?.country

  const fullname =
    receiptPurchaser?.fullname ||
    data?.fullname ||
    `${data?.firstname} ${data?.lastname}`

  return {
    fullname,
    city,
    zip,
    country,
    state,
    businessName,
    ...receiptPurchaser?.dataValues,
  }
}

export const getReceiptDetails = async ({
  lockAddress,
  network,
  hash,
  tokenId,
}: ReceiptDetailsProps): Promise<{
  supplier: ReceiptBase | null
  purchaser: Partial<Receipt> | null
  receipt: any
}> => {
  const purchaser = await getPurchaserDetails({
    lockAddress,
    network,
    hash,
    tokenId,
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
