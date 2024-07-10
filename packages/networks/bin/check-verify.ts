import { isVerified, wait } from './utils/verify'
import { getAllNetworks } from './utils/loop'
import { getAllAddresses } from './utils/contracts'
import { log } from './utils/logger'

async function main() {
  const networks = await getAllNetworks()
  for (const { network } of networks) {
    const { id: chainId, name } = network
    const addresses = await getAllAddresses({ network })
    console.log(addresses)

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
        log({
          chainId,
          contractAddress,
          contractName,
          name,
          ...verified,
        })
      }
    }
  }
}
main()
  .then(() => console.log(' Done.'))
  .catch((err) => console.log(err))
