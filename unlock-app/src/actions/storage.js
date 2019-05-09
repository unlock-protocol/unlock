export const STORAGE_ERROR = 'storage/STORAGE_ERROR'

export function storageError(error) {
  return {
    type: STORAGE_ERROR,
    error: error,
  }
}
