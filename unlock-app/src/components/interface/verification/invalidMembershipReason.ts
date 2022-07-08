import * as z from 'zod'
import { isSignatureValidForAddress } from '~/utils/signatures'
import { MembershipVerificationData } from '~/utils/verification'
import { Membership } from './KeyCard'

interface Options {
  membership: Membership
  rawData: string
  data: z.infer<typeof MembershipVerificationData>
  sig: string
}

export function invalidMembershipReason({
  membership,
  rawData,
  data,
  sig,
}: Options) {
  const { account, tokenId } = data
  if (!isSignatureValidForAddress(sig, decodeURIComponent(rawData), account)) {
    return 'Signature does not match!'
  }
  if (membership.tokenId.toString() !== tokenId.toString()) {
    return 'This key does not match the user'
  }

  if (membership.owner !== account) {
    return 'The owner of this key does not match the QR code'
  }

  if (
    membership.expiration != -1 &&
    membership.expiration < new Date().getTime() / 1000
  ) {
    return 'This ticket has expired'
  }
  return
}
