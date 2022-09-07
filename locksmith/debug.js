import { notifyNewKeyToWedlocks } from './src/operations/wedlocksOperations'
import * as keysOperations from './src/operations/keysOperations'

const run = async () => {
  const lockAddress = '0x2F3c9b71f256E7450c47872aE00389C616B08646'
  const lockName = 'DappCon22 - General Tickets'
  const network = 100
  const page = 0

  const filters = {
    query: '',
    page,
    filterKey: '',
    expiration: 'active',
  }

  const keys = await keysOperations.getKeysWithMetadata({
    network,
    lockAddress,
    filters,
    loggedInUserAddress: '0x2F3c9b71f256E7450c47872aE00389C616B08646',
  })

  const processNext = async (list) => {
    let next = list.pop()
    if (!next) {
      return
    }
    await notifyNewKeyToWedlocks(
      {
        keyId: next.token,
        lock: {
          address: lockAddress,
          name: lockName,
        },
        owner: {
          address: next.keyholderAddress,
        },
      },
      network,
      true // attach QR code
    )
    return processNext(list)
  }
  await processNext(keys)
}

async function main() {
  run()
}

main()
