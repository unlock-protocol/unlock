import utils from '../../utils'
import { UNLIMITED_KEYS_COUNT, ZERO } from '../../constants'
import {
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
} from '../../erc20'

// parser for contract getters
const attributes = {
  name: (x) => x,
  keyPrice: (x) => x,
  expirationDuration: (value) => {
    if (utils.isInfiniteDuration(value)) {
      return -1
    }
    return parseInt(value, 10)
  },
  maxNumberOfKeys: (value) => {
    if (utils.isInfiniteKeys(value)) {
      return UNLIMITED_KEYS_COUNT
    }
    return utils.toNumber(value)
  },
  maxKeysPerAddress: parseInt,
  beneficiary: (x) => x,
  totalSupply: parseInt,
  tokenAddress: (x) => x,
  publicLockVersion: parseInt,
  unlockProtocol: (x) => x,
}

export default async function (address, provider, { fields = [] } = {}) {
  const fieldItems = fields
    .map((f) => f.toLowerCase().trim())
    .concat(['unlockprotocol'])

  const network = await provider.getNetwork()
  const networkConfig = this.networks?.[network.chainId]
  const contract = await this.getLockContract(address, provider)
  // Let's load the current block to use to compare versions
  const getBlockNumber = async () => {
    const blockNumber = await provider.getBlockNumber()
    update.asOf = blockNumber
  }

  const update = {}

  const constantPromises = Object.keys(attributes)
    .filter((func) => Object.keys(contract).includes(func))
    .map(async (attribute) => {
      if (
        fields.length &&
        !fieldItems.includes(attribute.toLowerCase().trim())
      ) {
        return
      }
      const result = await contract.functions[`${attribute}()`]()
      update[attribute] = attributes[attribute](result[0]) // We cast the value
    })

  constantPromises.push(getBlockNumber())

  await Promise.all(constantPromises)

  if (update.tokenAddress) {
    if (update.tokenAddress === ZERO) {
      if (update.keyPrice) {
        // If ether, the price is stored as Wei.
        update.keyPrice = utils.fromWei(update.keyPrice, 'ether')
      }
      const balance = await provider.getBalance(address)
      update.balance = utils.fromWei(balance, 'ether')
      update.currencySymbol = networkConfig?.nativeCurrency?.symbol
      update.currencyDecimals = networkConfig?.nativeCurrency?.decimals
      update.currencyName = networkConfig?.nativeCurrency?.name
    } else {
      // Otherwise need to get the erc20's decimal and convert from there, as well as the symbol
      const [erc20Decimals, erc20Balance, erc20Symbol] = await Promise.all([
        getErc20Decimals(update.tokenAddress, provider),
        getErc20BalanceForAddress(update.tokenAddress, address, provider),
        getErc20TokenSymbol(update.tokenAddress, provider),
      ])
      if (update.keyPrice) {
        update.keyPrice = utils.fromDecimal(update.keyPrice, erc20Decimals)
      }
      update.balance = utils.fromDecimal(erc20Balance, erc20Decimals)
      update.currencySymbol = erc20Symbol
      update.currencyDecimals = erc20Decimals
      update.currencyName = erc20Symbol
    }
  }

  // totalSupply was previously called outstandingKeys. In order to keep compatibility
  // we also assign it. This behavior will eventually be deprecated
  update.outstandingKeys = update.totalSupply
  delete update.totalSupply

  // Using `currencyContractAddress` to be consistent with the createLock method
  if (update.tokenAddress === ZERO) {
    update.currencyContractAddress = null
  } else {
    update.currencyContractAddress = update.tokenAddress
  }
  delete update.tokenAddress

  if (update.unlockProtocol) {
    // rename to make it clearer
    update.unlockContractAddress = update.unlockProtocol
    delete update.unlockProtocol
  }
  return update
}
