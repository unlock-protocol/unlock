import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Receipt, ReceiptBase } from '../models'
import { getMetadataByTokenId } from './userMetadataOperations'
import { lowercaseObjectKeys } from '../utils/object'

interface ReceiptDetailsProps {
  lockAddress: string
  network: number
  hash: string
  tokenId?: string
}

/** Get purchaser details from metadata when receipt purchaser is not present */
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

  const data = lowercaseObjectKeys(metadata?.userMetadata?.protected ?? {})

  // return metadata when receipt data is not present
  if (!receiptPurchaser?.id) {
    const fullname =
      data?.fullname || (data?.firstname && data?.lastname)
        ? `${data?.firstname} ${data?.lastname}`
        : ''

    return {
      fullname,
      businessName: data?.businessName || data?.company,
      city: data?.city,
      zip: data?.zip || data?.zipcode,
      state: data?.state,
      country: data?.country,
      addressLine1: data?.addressLine1 || data?.address,
      addressLine2: data?.addressLine2,
    }
  }

  return receiptPurchaser
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
