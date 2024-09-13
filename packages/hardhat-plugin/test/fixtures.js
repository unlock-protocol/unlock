const { ethers } = require('ethers')
const publicLock = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  currencyContractAddress: ethers.ZeroAddress,
  keyPrice: ethers.parseEther('.001'), // in wei
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
  ERC20: { ...publicLock, currencyContractAddress: ethers.ZeroAddress },
  NON_EXPIRING: {
    ...publicLock,
    expirationDuration: 0, // indicates that the lock should not expired
  },
}
