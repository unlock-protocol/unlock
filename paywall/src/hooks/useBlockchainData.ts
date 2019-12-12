import useListenForPostMessage from './browser/useListenForPostMessage'
import { PostMessages } from '../messageTypes'
import { Account, Locks, PaywallConfig, Transactions } from '../unlockTypes'

import {
  isAccountOrNull,
  isPositiveInteger,
  isValidLocks,
  isValidKeys,
  isValidTransactions,
  isPositiveNumber,
} from '../utils/validators'
import useConfig from './utils/useConfig'

interface blockchainData {
  account: Account | null
  network: number
  locks: Locks
  transactions: Transactions
  checkWallet: boolean
  keys: any
}

/**
 * @param {window} window the global context (window, self, global)
 * @param {object} paywallConfig the paywall configuration passed into window.unlockProtocolConfig
 */
export default function useBlockchainData(
  window: any,
  paywallConfig: PaywallConfig
): blockchainData {
  // this is our default network value until we hear otherwise from the data iframe
  const { requiredNetworkId } = useConfig()

  // by default, checkWallet is false
  const checkWallet = useListenForPostMessage({
    type: PostMessages.UPDATE_WALLET,
    defaultValue: false,
    validator: () => true, // Let's assume it's always valid
    local: 'useBlockchainData [checkWallet]',
  })

  // by default, we have no address until we hear otherwise
  const address = useListenForPostMessage({
    type: PostMessages.UPDATE_ACCOUNT,
    defaultValue: null,
    validator: isAccountOrNull,
    local: 'useBlockchainData [account]',
  })

  const network = useListenForPostMessage({
    type: PostMessages.UPDATE_NETWORK,
    defaultValue: requiredNetworkId,
    validator: (val: any) => isPositiveInteger(val) && typeof val === 'number',
    local: 'useBlockchainData [network]',
  })

  // our default account balance is {} until we hear from the blockchain handler
  // balance must use isPositiveNumber to validate
  const balance = useListenForPostMessage({
    type: PostMessages.UPDATE_ACCOUNT_BALANCE,
    defaultValue: {},
    validator: (val: any) => {
      return Object.keys(val).reduce((accumulator, currency) => {
        return (
          accumulator &&
          isPositiveNumber(val[currency]) &&
          typeof val[currency] === 'string'
        )
      }, true)
    },
    local: 'useBlockchainData [balance]',
  })

  // retrieve the locks from the data iframe
  const blockChainLocks = useListenForPostMessage({
    type: PostMessages.UPDATE_LOCKS,
    defaultValue: {},
    validator: isValidLocks,
    local: 'useBlockchainData [locks]',
  })

  // retrieve the keys from the data iframe
  const keys = useListenForPostMessage({
    type: PostMessages.UPDATE_KEYS,
    defaultValue: {},
    validator: isValidKeys,
    local: 'useBlockchainData [keys]',
  })

  // retrieve the transactions from the data iframe
  const transactions = useListenForPostMessage({
    type: PostMessages.UPDATE_TRANSACTIONS,
    defaultValue: {},
    validator: isValidTransactions,
    local: 'useBlockchainData [transactions]',
  })

  // construct the object format expected by the checkout UI
  const account = address ? { address, balance } : null

  const paywallLockAddresses = Object.keys(paywallConfig.locks)
  const blockChainLockAddresses = Object.keys(blockChainLocks)

  // filter out any locks that are not on this paywall
  const filteredLockAddresses = blockChainLockAddresses.filter(address =>
    paywallLockAddresses.includes(address)
  )
  if (filteredLockAddresses.length !== blockChainLockAddresses.length) {
    // eslint-disable-next-line
    window.console.warn(
      'internal error: data iframe returned locks not known to the paywall'
    )
  }

  const locks = filteredLockAddresses.reduce(
    (newLocks, lockAddress) => ({
      ...newLocks,
      [lockAddress]: {
        ...blockChainLocks[lockAddress],
      },
    }),
    {}
  )

  return {
    checkWallet,
    account,
    network,
    locks,
    transactions,
    keys,
  }
}
