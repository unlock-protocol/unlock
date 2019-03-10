export const SIGNATURE_ERROR = 'signature/SIGNATURE_ERROR'
export const SIGNED_DATA = 'signature/SIGNED_DATA'
export const SIGN_DATA = 'signature/SIGN_DATA'

export function signatureError(error) {
  return {
    type: SIGNATURE_ERROR,
    error: error,
  }
}

export function signData(data) {
  return {
    type: SIGN_DATA,
    data,
  }
}

export function signedData(data, signature) {
  return {
    type: SIGNED_DATA,
    data,
    signature,
  }
}
