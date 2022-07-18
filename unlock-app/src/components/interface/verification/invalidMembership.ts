import * as z from 'zod'
import { MembershipVerificationData } from '~/utils/verification'

interface Options {
  owner: string
  keyId: string
  expiration: number
  isSignatureValid: boolean
  verificationData: z.infer<typeof MembershipVerificationData>
}

export function invalidMembership({
  owner,
  keyId,
  expiration,
  isSignatureValid,
  verificationData,
}: Options) {
  const { account, tokenId } = verificationData
  if (!isSignatureValid) {
    return 'Signature does not match'
  }
  if (keyId !== tokenId.toString()) {
    return 'This key does not match the user'
  }

  if (owner !== account) {
    return 'The owner of this key does not match the QR code'
  }

  if (expiration != -1 && expiration < new Date().getTime() / 1000) {
    return 'This ticket has expired'
  }
  return
}
