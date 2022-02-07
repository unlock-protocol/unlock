const { constants, utils } = require('ethers')

const publicLock = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  currencyContractAddress: null,
  keyPrice: utils.parseEther('.1'), // in wei
  maxNumberOfKeys: 10,
  name: 'Unlock-Protocol Lock',
}

export const locks = {
  FIRST: Object.assign({}, publicLock, {}),
  SECOND: Object.assign({}, publicLock, {}),
  'SINGLE KEY': Object.assign({}, publicLock, {
    maxNumberOfKeys: 1,
  }),
  NAMED: Object.assign({}, publicLock, {
    name: 'Custom Named Lock',
  }),
  FREE: Object.assign({}, publicLock, {
    keyPrice: 0,
  }),
  SHORT: Object.assign({}, publicLock, {
    expirationDuration: 5, // 5 seconds
  }),
  ERC20: Object.assign({}, publicLock, {
    currencyContractAddress: constants.AddressZero,
  }),
  NON_EXPIRING: Object.assign({}, publicLock, {
    expirationDuration: 0, // indicates that the lock should not expired
  }),
}
