import { Task } from 'graphile-worker'
import { renewKey } from '../../helpers'
import { z } from 'zod'
import { timeout } from '../../taskUtils/timeout'

const Payload = z.object({
  keyId: z.coerce.string(),
  lockAddress: z.coerce.string(),
  network: z.number(),
  userAddress: z.coerce.string(),
})

// Timeout after 10 minutes
export const cryptoRenewalJob: Task = timeout(
  600 * 1000,
  async (payload) => {
    const parsed = Payload.parse(payload)
    const response = await renewKey(parsed)
    if (!response.error) {
      return
    }
    // This will cause the job to be re-tried
    throw new Error(response.error)
  },
  'Crypto Renewal Job timed out after 10 mins'
)
