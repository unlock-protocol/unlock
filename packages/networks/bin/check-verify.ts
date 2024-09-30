import { isVerified, wait } from './utils/etherscan'
import { getAllNetworks } from './utils/loop'
import { getAllAddresses } from './utils/contracts'
import { log } from './utils/logger'
import { ZeroAddress } from 'ethers'

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
      // dont log missing contracts
      if (contractAddress && contractAddress !== ZeroAddress) {
        await wait(250)
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
}
main()
  .then(() => console.log(' Done.'))
  .catch((err) => console.log(err))
