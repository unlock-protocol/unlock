const { constants, utils } = require('ethers')

const publicLock = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  currencyContractAddress: constants.AddressZero,
  keyPrice: utils.parseEther('.001').toNumber(), // in wei
  maxNumberOfKeys: 10,
  name: 'Unlock-Protocol Lock',
}

export const locks = {
  FIRST: { ...publicLock },
  SECOND: { ...publicLock },
  'SINGLE KEY': { ...publicLock, maxNumberOfKeys: 1 },
  NAMED: { ...publicLock, name: 'Custom Named Lock' },
  FREE: { ...publicLock, keyPrice: 0 },
  SHORT: {
    ...publicLock,
    expirationDuration: 5, // 5 seconds
  },
  ERC20: { ...publicLock, currencyContractAddress: constants.AddressZero },
  NON_EXPIRING: {
    ...publicLock,
    expirationDuration: 0, // indicates that the lock should not expired
  },
}
