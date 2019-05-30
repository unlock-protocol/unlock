import useListenForPostMessage from './browser/useListenForPostMessage'
import {
  POST_MESSAGE_UPDATE_ACCOUNT,
  POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
  POST_MESSAGE_UPDATE_LOCKS,
  POST_MESSAGE_UPDATE_NETWORK,
} from '../paywall-builder/constants'
import {
  isAccount,
  isPositiveInteger,
  isValidLocks,
  isPositiveNumber,
} from '../utils/validators'
import useConfig from './utils/useConfig'

/**
 * @param {window} window the global context (window, self, global)
 * @param {object} paywallConfig the paywall configuration passed into window.unlockProtocolConfig
 */
export default function useBlockchainData(window, paywallConfig) {
  // this is our default network value until we hear otherwise from the data iframe
  const { requiredNetworkId } = useConfig(window)
  // by default, we have no address until we hear otherwise
  const address = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_ACCOUNT,
    defaultValue: null,
    validator: isAccount,
  })
  const network = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_NETWORK,
    defaultValue: requiredNetworkId,
    validator: val => isPositiveInteger(val) && typeof val === 'number',
  })
  // our default account balance is '0' until we hear from the blockchain handler
  // balance is in eth, we must use isPositiveNumber to validate
  const balance = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
    defaultValue: '0',
    validator: val => isPositiveNumber(val) && typeof val === 'string',
  })
  // retrieve the locks from the data iframe
  const blockChainLocks = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_LOCKS,
    defaultValue: {},
    validator: isValidLocks,
  })

  // construct the object format expected by the checkout UI
  const account = address ? { address, balance } : null

  // populate lcoks with the lock names, either from the chain
  // or from the paywall config
  const locks = Object.keys(blockChainLocks).reduce(
    (newLocks, lockAddress) => ({
      ...newLocks,
      [lockAddress]: {
        ...blockChainLocks[lockAddress],
        // we always use the configuration name to provide flexibility
        // even if the lock has a name set on the contract
        name: paywallConfig.locks[lockAddress].name,
      },
    }),
    {}
  )

  return {
    account,
    network,
    locks,
  }
}
