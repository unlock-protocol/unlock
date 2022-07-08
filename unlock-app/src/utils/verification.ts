import * as z from 'zod'

export const MembershipVerificationData = z.object({
  account: z.string(),
  timestamp: z.number(),
  tokenId: z.string(),
  network: z.number(),
  lockAddress: z.string(),
})

export const MembershipVerification = z.object({
  data: MembershipVerificationData,
  sig: z.string(),
})

export function getMembershipVerificationConfig(query: Record<string, any>) {
  try {
    const item = {
      sig: query.sig,
      data: JSON.parse(decodeURIComponent(query.data)),
    }
    const result = MembershipVerification.parse(item)
    return result
  } catch (error) {
    return null
  }
}
