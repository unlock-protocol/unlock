import { Task } from 'graphile-worker'
import { renewFiatKey } from '../../helpers'
import { z } from 'zod'

const Payload = z.object({
  keyId: z.coerce.string(),
  lockAddress: z.coerce.string(),
  userAddress: z.coerce.string(),
  network: z.number(),
})

export const fiatRenewalJob: Task = async (payload) => {
  const parsed = Payload.parse(payload)
  const response = await renewFiatKey(parsed)
  if (!response.error) {
    return
  }
  // This will cause the job to be re-tried
  throw new Error(response.error)
}
