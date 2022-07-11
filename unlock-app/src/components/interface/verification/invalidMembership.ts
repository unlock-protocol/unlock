import * as z from 'zod'
import { MembershipVerificationData } from '~/utils/verification'
import { MembershipData } from './MembershipCard'

interface Options {
  membershipData: MembershipData
  isSignatureValid: boolean
  verificationData: z.infer<typeof MembershipVerificationData>
}

export function invalidMembership({
  membershipData,
  isSignatureValid,
  verificationData,
}: Options) {
  const { account, tokenId } = verificationData
  if (!isSignatureValid) {
    return 'Signature does not match'
  }
  if (membershipData?.keyId?.toString() !== tokenId.toString()) {
    return 'This key does not match the user'
  }

  if (membershipData.owner !== account) {
    return 'The owner of this key does not match the QR code'
  }

  if (
    membershipData.expiration != -1 &&
    membershipData.expiration < new Date().getTime() / 1000
  ) {
    return 'This ticket has expired'
  }
  return
}
