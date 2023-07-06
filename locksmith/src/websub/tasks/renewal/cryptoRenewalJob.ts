import { Task } from 'graphile-worker'
import { renewKey } from '../../helpers'
import { z } from 'zod'

const Payload = z.object({
  keyId: z.coerce.string(),
  lockAddress: z.coerce.string(),
  network: z.number(),
  userAddress: z.coerce.string(),
})

export const cryptoRenewalJob: Task = async (payload) => {
  const parsed = Payload.parse(payload)
  const response = await renewKey(parsed)
  if (!response.error) {
    return
  }
  // This will cause the job to be re-tried
  throw new Error(response.error)
}
