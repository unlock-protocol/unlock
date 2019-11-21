export const SIGN_BULK_METADATA_REQUEST =
  'keyMetadata/SIGN_BULK_METADATA_REQUEST'
export const SIGN_BULK_METADATA_RESPONSE =
  'keyMetadata/SIGN_BULK_METADATA_RESPONSE'
export const GOT_BULK_METADATA = 'keyMetadata/GOT_BULK_METADATA'

export function signBulkMetadataRequest(lockAddress: string, owner: string) {
  return {
    type: SIGN_BULK_METADATA_REQUEST,
    lockAddress,
    owner,
    timestamp: Date.now(),
  }
}

export function signBulkMetadataResponse(
  data: any,
  signature: any,
  lockAddress: string
) {
  return {
    type: SIGN_BULK_METADATA_RESPONSE,
    data,
    signature,
    lockAddress,
  }
}

export function gotBulkMetadata(lockAddress: string, data: any) {
  return {
    type: GOT_BULK_METADATA,
    lockAddress,
    data,
  }
}
