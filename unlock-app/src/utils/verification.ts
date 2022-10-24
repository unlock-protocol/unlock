import * as z from 'zod'

export const MembershipVerificationData = z.object({
  account: z.string(),
  timestamp: z.number(),
  tokenId: z.optional(
    z.union([z.string(), z.number()]).transform((value) => value.toString())
  ),
  network: z.number(),
  lockAddress: z.string(),
})

export const MembershipVerificationConfig = z.object({
  data: MembershipVerificationData,
  sig: z.string(),
  raw: z.string(),
})

interface Options {
  data?: string | null
  sig?: string | null
}

export function getMembershipVerificationConfig({ data, sig }: Options) {
  try {
    if (sig && data) {
      const raw = decodeURIComponent(decodeURIComponent(data))
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
