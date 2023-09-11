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
  keyId,
  expiration,
  isSignatureValid,
  verificationData,
}: Options) {
  const { tokenId } = verificationData
  if (!isSignatureValid) {
    return 'Signature does not match'
  }

  if (tokenId && keyId !== tokenId.toString()) {
    return 'This key does not match the user'
  }

  if (expiration != -1 && expiration < new Date().getTime() / 1000) {
    return 'This ticket has expired'
  }
  return
}
