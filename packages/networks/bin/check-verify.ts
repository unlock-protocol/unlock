import { isVerified, wait } from './utils/verify'
import { getAllNetworks } from './utils/loop'
import { getAllAddresses } from './utils/contracts'
import { log } from './utils/logger'

export const logError = ({
  name,
  chainId,
  contractName,
  contractAddress,
  result,
  message,
}) =>
  log(
    `[Verification]: ${contractName}  on ${name} (${chainId}) at ${contractAddress}: ${result} (${message})`,
    'error'
  )

async function main() {
  // ignore zksync bcz of their custom veriffier
  const networks = await getAllNetworks({ exclude: [324] })
  for (const { network } of networks) {
    const { id: chainId, name } = network
    const addresses = await getAllAddresses({ network })
    // api calls
    for (const contractName in addresses) {
      const contractAddress = addresses[contractName]
      await wait(100)
      const verified = await isVerified({
        chainId,
        contractAddress,
      })

      // log results
      if (!verified?.isVerified) {
        logError({
          chainId,
          contractAddress,
          contractName,
          message: verified?.message,
          name,
          result: verified?.result,
        })
      }
    }
  }
}
main()
  .then(() => console.log(' Done.'))
  .catch((err) => console.log(err))
