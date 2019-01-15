export const SIGNATURE_ERROR = 'SIGNATURE_ERROR'

export function signatureError(error) {
  return {
    type: 'SIGNATURE_ERROR',
    error: error,
  }
}
