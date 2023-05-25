import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Receipt, ReceiptBase } from '../models'
import { getMetadata } from './userMetadataOperations'
import { lowercaseObjectKeys } from '../utils/object'

interface ReceiptDetailsProps {
  lockAddress: string
  network: number
  hash: string
  tokenId?: string
}

export const getSingleReceiptDetails = async ({
  hash,
  network,
}: {
  hash: string
  network: number
}) => {
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

  return receipt
}

/** Get purchaser details from metadata when receipt purchaser is not present */
const getPurchaserDetails = async ({
  lockAddress,
  network,
  hash,
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

  // get purchaser metadata details
  let metadata: any
  const receipt = await getSingleReceiptDetails({ hash, network })
  if (receipt?.payer) {
    metadata = await getMetadata(lockAddress, receipt.payer, true)
  }

  const keyOwnerMetadata = lowercaseObjectKeys(
    metadata?.userMetadata?.protected
  )

  // return purchaser metadata details there is not stored data
  if (!purchaserDetails) {
    let fullname: string | undefined = undefined
    if (keyOwnerMetadata?.fullname) {
      fullname = keyOwnerMetadata.fullname
    } else if (keyOwnerMetadata?.firstname && keyOwnerMetadata?.lastname) {
      fullname = `${keyOwnerMetadata?.firstname} ${keyOwnerMetadata?.lastname}`
    }

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
}: ReceiptDetailsProps): Promise<{
  supplier: ReceiptBase | null
  purchaser: Partial<Receipt> | null
  receipt: any
}> => {
  const purchaserDetails = await getPurchaserDetails({
    lockAddress,
    network,
    hash,
  })

  const supplierDetails = await ReceiptBase.findOne({
    where: {
      lockAddress,
      network,
    },
  })

  const receipt = await getSingleReceiptDetails({ hash, network })

  return {
    supplier: supplierDetails,
    purchaser: purchaserDetails,
    receipt,
  }
}
