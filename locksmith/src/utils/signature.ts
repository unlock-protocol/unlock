import { ethers } from 'ethers'

export const expiredSignature = (
  signatureTimestamp: number,
  gracePeriod = 10000
): boolean => {
  const serverTime = Date.now() / 1000
  const signatureTime = signatureTimestamp / 1000

  return signatureTime + gracePeriod < serverTime
}

export const generateTypedSignature = async (privateKey: string, data: any) => {
  const wallet = new ethers.Wallet(privateKey)
  const { domain, types, message } = data
  const signature = await wallet._signTypedData(domain, types, message)

  return signature
}
