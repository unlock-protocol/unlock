import { Task } from 'graphile-worker'
import { z } from 'zod'
import * as keysOperations from '../../operations/keysOperations'
import { PAGE_SIZE } from '../../utils/constants'
import { uploadJsonToS3 } from '../../utils/s3'
import config from '../../config/config'

export const ExportKeysJobPayload = z.object({
  jobId: z.string(),
  lockAddress: z.string(),
  network: z.number(),
  query: z.string().optional(),
  filterKey: z.string(),
  expiration: z.string(),
  approval: z.string(),
  loggedInUserAddress: z.string(),
})
// TODO: add progress status
// For this we would probably need to add a new model in which we would store the progress!
const exportKeysJob: Task = async (payload) => {
  const parsed = await ExportKeysJobPayload.parse(payload)

  let allKeys: any = []
  let page = 0
  const max = PAGE_SIZE
  let totalFetched = 0
  let totalPages = Infinity

  while (page < totalPages) {
    const filters = {
      query: parsed.query,
      filterKey: parsed.filterKey,
      expiration: parsed.expiration,
      approval: parsed.approval,
      max,
      after: allKeys[allKeys.length - 1]?.token,
    }

    const { keys, total } = await keysOperations.getKeysWithMetadata({
      network: parsed.network,
      lockAddress: parsed.lockAddress,
      filters: filters,
      loggedInUserAddress: parsed.loggedInUserAddress,
    })

    allKeys = [...allKeys, ...keys].sort((k, l) => k.token - l.token)
    totalFetched += keys.length
    page++

    totalPages = Math.ceil(total / PAGE_SIZE)

    if (keys.length === 0) {
      break
    }
  }

  await uploadJsonToS3(config.storage.exportsBucket, parsed.jobId, {
    keys: allKeys,
  })
}

export default exportKeysJob
