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
}: ReceiptDetailsProps): Promise<Partial<
  Receipt & { email?: string }
> | null> => {
  const purchaserDetails = await Receipt.findOne({
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
  if (!purchaserDetails) {
    const fullname =
      data?.fullname || (data?.firstname && data?.lastname)
        ? `${data?.firstname} ${data?.lastname}`
        : ''

    return {
      email: data?.email,
      fullname,
      businessName: data?.businessname || data?.company,
      city: data?.city,
      zip: data?.zip || data?.zipcode,
      state: data?.state,
      country: data?.country,
      addressLine1: data?.addressline1 || data?.address,
      addressLine2: data?.addressline2,
    }
  }

  return purchaserDetails
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
  const purchaserDetails = await getPurchaserDetails({
    lockAddress,
    network,
    hash,
    tokenId,
  })

  const supplierDetails = await ReceiptBase.findOne({
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
    supplier: supplierDetails,
    purchaser: purchaserDetails,
    receipt,
  }
}
