import * as z from 'zod'
import { isSignatureValidForAddress } from '~/utils/signatures'
import { MembershipVerificationData } from '~/utils/verification'

interface Options {
  membershipData: any
  rawData: string
  data: z.infer<typeof MembershipVerificationData>
  sig: string
}

export function invalidMembershipReason({
  membershipData,
  rawData,
  data,
  sig,
}: Options) {
  const { account, tokenId } = data
  if (!isSignatureValidForAddress(sig, decodeURIComponent(rawData), account)) {
    return 'Signature does not match!'
  }
  if (membershipData.keyId.toString() !== tokenId.toString()) {
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
