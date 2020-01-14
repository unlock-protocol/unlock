export const SIGNATURE_ERROR = 'signature/SIGNATURE_ERROR'
export const SIGNED_DATA = 'signature/SIGNED_DATA'
export const SIGN_DATA = 'signature/SIGN_DATA'

export function signatureError(error) {
  return {
    type: SIGNATURE_ERROR,
    error,
  }
}

export function signData(data, id) {
  return {
    type: SIGN_DATA,
    data,
    id,
  }
}

export function signedData(data, id, signature) {
  return {
    type: SIGNED_DATA,
    data,
    id,
    signature,
  }
}
