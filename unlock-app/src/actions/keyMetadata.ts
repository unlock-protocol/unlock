export const SIGN_METADATA_REQUEST = 'keyMetadata/SIGN_METADATA_REQUEST'
export const SIGN_METADATA_RESPONSE = 'keyMetadata/SIGN_METADATA_RESPONSE'

export function signMetadataRequest(address: string, owner: string) {
  return {
    type: SIGN_METADATA_REQUEST,
    address,
    owner,
    timestamp: Date.now(),
  }
}

export function signMetadataResponse(data: any, signature: any) {
  return {
    type: SIGN_METADATA_RESPONSE,
    data,
    signature,
  }
}
