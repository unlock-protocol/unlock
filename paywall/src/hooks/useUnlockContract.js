import Web3Utils from 'web3-utils'

import UnlockContract from '../artifacts/contracts/Unlock.json'
import useConfig from './utils/useConfig'
import { NON_DEPLOYED_CONTRACT } from '../errors'

export default function useUnlockContract() {
  const { unlockAddress, requiredNetworkId } = useConfig()

  let unlockContractAddress
  if (unlockAddress) {
    unlockContractAddress = Web3Utils.toChecksumAddress(unlockAddress)
  } else if (UnlockContract.networks[requiredNetworkId]) {
    // If we do not have an address from config let's use the artifact files
    unlockContractAddress = Web3Utils.toChecksumAddress(
      UnlockContract.networks[requiredNetworkId].address
    )
  } else {
    throw new Error(NON_DEPLOYED_CONTRACT)
  }
  return unlockContractAddress
}
