import * as z from 'zod'

export const MembershipVerificationData = z.object({
  account: z.string(),
  timestamp: z.number(),
  tokenId: z.string(),
  network: z.number(),
  lockAddress: z.string(),
})

export const MembershipVerificationConfig = z.object({
  data: MembershipVerificationData,
  sig: z.string(),
  raw: z.string(),
})

interface Options {
  data?: string
  sig?: string
}

export function getMembershipVerificationConfig({ data, sig }: Options) {
  try {
    if (sig && data) {
      const raw = decodeURIComponent(data)
      const result = MembershipVerificationConfig.parse({
        sig,
        raw,
        data: JSON.parse(raw),
      })
      return result
    }
  } catch (error) {
    console.error(error)
  }
}

export type MembershipVerificationData = z.infer<
  typeof MembershipVerificationData
>

export type MembershipVerificationConfig = z.infer<
  typeof MembershipVerificationConfig
>
