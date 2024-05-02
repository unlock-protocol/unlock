import { logger } from '../logger'
import * as keysOperations from '../operations/keysOperations'
import { notifyNewKeyToWedlocks } from '../operations/wedlocksOperations'

logger.info('Runner started.')

const network = 8453
const lockAddress = '0x456CC03543d41Eb1c9a7cA9FA86e9383B404f50d'

const run = async () => {
  const { keys, total } = await keysOperations.getKeysWithMetadata({
    network,
    lockAddress,
    filters: {},
    loggedInUserAddress: '0xF5C28ce24Acf47849988f147d5C75787c0103534',
  })

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const sent = await notifyNewKeyToWedlocks(
      {
        tokenId: key.token,
        lock: {
          address: key.lockAddress,
          name: key.lockName,
        },
        manager: key.keyManager,
        owner: key.keyholderAddress,
      },
      network
    )
  }
  logger.info('Runner done!')
}

run()
