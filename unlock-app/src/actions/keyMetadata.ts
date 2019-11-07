export const SIGN_METADATA_REQUEST = 'keyMetadata/SIGN_METADATA_REQUEST'
export const SIGN_METADATA_RESPONSE = 'keyMetadata/SIGN_METADATA_RESPONSE'
export const GOT_METADATA = 'keyMetadata/GOT_METADATA'

export function signMetadataRequest(
  lockAddress: string,
  owner: string,
  keyIds: string[]
) {
  return {
    type: SIGN_METADATA_REQUEST,
    lockAddress,
    owner,
    keyIds,
    timestamp: Date.now(),
  }
}

export function signMetadataResponse(
  data: any,
  signature: any,
  keyIds: string[],
  lockAddress: string
) {
  return {
    type: SIGN_METADATA_RESPONSE,
    data,
    signature,
    keyIds,
    lockAddress,
  }
}

export function gotMetadata(lockAddress: string, keyId: string, data: any) {
  return {
    type: GOT_METADATA,
    lockAddress,
    keyId,
    data,
  }
}
