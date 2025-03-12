import { logger } from '../logger'
import { notifyExpiringKey } from '../worker/jobs/expiringKeys'

const run = async () => {
  logger.info('Runner started.')
  // Do stuff!
  await notifyExpiringKey(
    {
      lock: {
        name: 'Lock',
        address: '0x840B4F67D8B255613F351904D2d43FC3E7d34752',
        tokenAddress: '', // currency
      },
      tokenId: '2',
      owner: '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f',
      expiration: 1741791800,
    },
    43114
  )
  logger.info('Runner done!')
}

run()
