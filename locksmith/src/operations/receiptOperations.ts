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

  // return purchaser metadata details there is not stored data
  if (!purchaserDetails) {
    // get purchaser metadata details
    let metadata: any
    const receipt = await getSingleReceiptDetails({ hash, network })
    if (receipt?.payer) {
      metadata = await getMetadata(lockAddress, receipt.payer, true)
    }

    const purchaserMetadata = lowercaseObjectKeys(
      metadata?.userMetadata?.protected
    )
    let fullname: string | undefined = undefined
    if (purchaserMetadata?.fullname) {
      fullname = purchaserMetadata.fullname
    } else if (purchaserMetadata?.firstname && purchaserMetadata?.lastname) {
      fullname = `${purchaserMetadata?.firstname} ${purchaserMetadata?.lastname}`
    }

    return {
      email: purchaserMetadata?.email,
      fullname,
      businessName:
        purchaserMetadata?.businessname || purchaserMetadata?.company,
      city: purchaserMetadata?.city,
      zip: purchaserMetadata?.zip || purchaserMetadata?.zipcode,
      state: purchaserMetadata?.state,
      country: purchaserMetadata?.country,
      addressLine1:
        purchaserMetadata?.addressline1 || purchaserMetadata?.address,
      addressLine2: purchaserMetadata?.addressline2,
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
