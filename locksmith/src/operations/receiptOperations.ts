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

  const keyOwnerMetadata = lowercaseObjectKeys(
    metadata?.userMetadata?.protected
  )

  // return metadata when receipt data is not present
  if (!purchaserDetails) {
    const fullname =
      keyOwnerMetadata?.fullname ||
      (keyOwnerMetadata?.firstname && keyOwnerMetadata?.lastname)
        ? `${keyOwnerMetadata?.firstname} ${keyOwnerMetadata?.lastname}`
        : ''

    return {
      email: keyOwnerMetadata?.email,
      fullname,
      businessName: keyOwnerMetadata?.businessname || keyOwnerMetadata?.company,
      city: keyOwnerMetadata?.city,
      zip: keyOwnerMetadata?.zip || keyOwnerMetadata?.zipcode,
      state: keyOwnerMetadata?.state,
      country: keyOwnerMetadata?.country,
      addressLine1: keyOwnerMetadata?.addressline1 || keyOwnerMetadata?.address,
      addressLine2: keyOwnerMetadata?.addressline2,
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
