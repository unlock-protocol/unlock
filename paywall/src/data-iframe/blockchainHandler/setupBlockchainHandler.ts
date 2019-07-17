import { PaywallConfig } from '../../unlockTypes'
import linkKeysToLocks from './linkKeysToLocks'
import { POLLING_INTERVAL } from '../../constants'
import {
  KeyResults,
  KeyResult,
  WalletServiceType,
  Web3ServiceType,
  ConstantsType,
  BlockchainData,
  LocksmithTransactionsResult,
  TransactionDefaults,
  FetchWindow,
  BlockchainValues,
} from './blockChainTypes'

/**
 * convert lock addresses to a normal form.
 */
export function normalizeLockAddress(address: string) {
  // TODO: export checksum lock function from web3Service and use that instead
  return address.toLowerCase()
}

/**
 * convert the key indices of an object to normalized form
 *
 * Used for normalizing key and lock indices
 */
export function normalizeAddressKeys(object: { [key: string]: any }) {
  return Object.keys(object).reduce(
    (newObject: { [key: string]: any }, key) => {
      const value = object[key]
      newObject[normalizeLockAddress(key)] = value
      return newObject
    },
    {}
  )
}

/**
 * Make empty keys for the current account
 */
export function makeDefaultKeys(
  lockAddresses: string[],
  account: string | null
) {
  return lockAddresses.reduce((allKeys: KeyResults, address: string) => {
    allKeys[address] = {
      lock: address,
      owner: account,
      expiration: 0,
    }
    return allKeys
  }, {})
}

interface setupListenersParams {
  walletService: WalletServiceType
  web3Service: Web3ServiceType
  getNewData: () => void
  propagateChanges: () => void
  lockAddresses: string[]
  values: BlockchainValues
}

/**
 * Setup the event listeners for account/key/lock/transaction changes
 */
export function setupListeners({
  walletService,
  web3Service,
  getNewData,
  propagateChanges,
  lockAddresses,
  values,
}: setupListenersParams) {
  const reset = () => {
    // we must have keys for every lock at all times
    values.keys = makeDefaultKeys(lockAddresses, values.account)
    values.transactions = {}
    getNewData()
  }
  // the event listeners propagate changes to the main window
  // or fetch new data when network or account changes
  walletService.on('account.changed', newAccount => {
    if (newAccount === values.account) return
    values.account = newAccount
    reset()
  })

  walletService.on('network.changed', networkId => {
    if (networkId === values.network) return
    values.network = networkId
    reset()
  })

  walletService.on(
    'account.updated',
    (balanceForAccount, { balance: newBalance }) => {
      // this can be called for locks also
      if (balanceForAccount !== values.account) return
      values.balance = newBalance
      propagateChanges()
    }
  )

  web3Service.on('key.updated', (_: any, key: KeyResult) => {
    key.lock = normalizeLockAddress(key.lock)
    values.keys[key.lock] = key
    propagateChanges()
  })

  const mergeUpdate = (
    key: string,
    type: 'transactions' | 'locks',
    defaults: Object,
    update: Object
  ) => {
    values[type][key] = values[type][key] || defaults
    values[type][key] = {
      ...values[type][key],
      ...update,
    }
    propagateChanges()
  }

  web3Service.on('transaction.updated', (hash, update) => {
    if (update.lock) {
      // ensure all references to locks are normalized
      update.lock = normalizeLockAddress(update.lock)
    }
    mergeUpdate(
      hash,
      'transactions',
      {
        blockNumber: Number.MAX_SAFE_INTEGER,
        hash,
      },
      update
    )
  })

  web3Service.on('lock.updated', (lockAddress, update) => {
    const address = normalizeLockAddress(lockAddress)
    mergeUpdate(
      address,
      'locks',
      {
        address,
      },
      update
    )
  })
}

interface retrieveTransactionsParams {
  lockAddresses: string[]
  constants: ConstantsType
  web3Service: Web3ServiceType
  window: FetchWindow
  values: BlockchainValues
}

export async function retrieveTransactions({
  lockAddresses,
  constants,
  web3Service,
  window,
  values,
}: retrieveTransactionsParams) {
  if (!values.account) return
  // filter the transactions we request to only include the
  // transactions relevant to locks. In most cases this will be
  // key purchases
  const filterLocks = lockAddresses
    .map(lockAddress => `recipient[]=${encodeURIComponent(lockAddress)}`)
    .join('&')

  const url = `${constants.locksmithHost}/transactions?for=${values.account}${
    filterLocks ? `&${filterLocks}` : ''
  }`

  const response = await window.fetch(url)
  const result: {
    transactions?: LocksmithTransactionsResult[]
  } = await response.json()
  if (result.transactions) {
    result.transactions
      .map(t => ({
        hash: t.transactionHash,
        network: t.chain,
        to: t.recipient,
        input: t.data,
        from: t.sender,
        for: t.for,
      }))
      .filter(transaction => transaction.network === values.network)
      .map((transaction: TransactionDefaults) => {
        // we pass the transaction as defaults if it has input set, so that we can
        // parse out the transaction type and other details. If input is not set,
        // we can't safely pass the transaction default
        web3Service.getTransaction(
          transaction.hash,
          transaction.input ? transaction : undefined
        )
      })
  }
}

interface setupBlockchainHandlerParams {
  walletService: WalletServiceType
  web3Service: Web3ServiceType
  constants: ConstantsType
  configuration: PaywallConfig
  emitChanges: (data: BlockchainData) => void
  window: FetchWindow
}

// assumptions:
// 1. walletService has been "connected" to the Web3ProxyProvider
// 2. config has been validated already
// 3. emitChanges will pass along the updates to the main window
export default async function setupBlockchainHandler({
  walletService,
  web3Service,
  constants,
  configuration,
  emitChanges,
  window,
}: setupBlockchainHandlerParams) {
  const values: BlockchainValues = {
    config: configuration,
    account: null,
    balance: '0',
    keys: {},
    locks: {},
    transactions: {},
    network: constants.defaultNetwork,
  }

  // take the paywall config, lower-case all the locks
  const configLocks = normalizeAddressKeys(configuration.locks)
  values.config.locks = configLocks
  // this will be used to filter the keys and transactions we return
  const lockAddresses = Object.keys(values.config.locks)
  // set the default keys now
  values.keys = makeDefaultKeys(lockAddresses, values.account)

  // first, retrieve the locks
  lockAddresses.forEach(address => web3Service.getLock(address))

  // this is used to link keys/transactions/locks and send all data to the post office
  const propagateChanges = async () => {
    const fullLocks = await linkKeysToLocks({
      locks: values.locks,
      keys: values.keys,
      transactions: values.transactions,
      requiredConfirmations: constants.requiredConfirmations,
    })
    emitChanges({
      locks: fullLocks,
      account: values.account,
      balance: values.balance,
      network: values.network,
    })
  }

  // set up event listeners
  setupListeners({
    walletService,
    web3Service,
    getNewData,
    propagateChanges,
    lockAddresses,
    values,
  })

  // poll for account changes
  setInterval(() => {
    if (!walletService.ready) return
    walletService.getAccount()
  }, POLLING_INTERVAL)

  // this fetches keys/transactions in parallel
  async function getNewData() {
    // set up keys prior to retrieval
    values.keys = makeDefaultKeys(lockAddresses, values.account)
    if (!values.account) {
      // no account, we only have fake keys and no transactions or balance
      values.transactions = {}
      values.balance = '0'
      return
    }
    // first get keys
    lockAddresses.map(address => {
      return web3Service.getKeyByLockForOwner(address, values.account as string)
    })

    // then transactions
    retrieveTransactions({
      lockAddresses,
      constants,
      web3Service,
      window,
      values,
    })
  }

  // the caller is responsible for triggering the first run
  return getNewData
}
