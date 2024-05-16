import { z } from 'zod'

const LockTypeSchema = z.object({
  isEvent: z.boolean().default(false),
  isCertification: z.boolean().default(false),
  isStamp: z.boolean().default(false),
})

export const getLockTypeByMetadata = (metadata?: any): LockType => {
  const attributes: Record<string, string>[] = metadata?.attributes || []

  const hasAttribute = (name: 'event' | 'certification' | 'stamp') => {
    return attributes.some(
      (attribute: { trait_type?: string }) =>
        attribute?.trait_type?.startsWith(name)
    )
  }

  return {
    isEvent: hasAttribute('event'),
    isCertification: hasAttribute('certification'),
    isStamp: hasAttribute('stamp'),
  }
}
export type LockType = z.infer<typeof LockTypeSchema>
