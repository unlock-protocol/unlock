export const expiredSignature = (
  signatureTimestamp: number,
  gracePeriod = 10000
): boolean => {
  const serverTime = Date.now() / 1000
  const signatureTime = signatureTimestamp / 1000

  return signatureTime + gracePeriod < serverTime
}
