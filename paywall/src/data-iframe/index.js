import start from './start'

const constants = {
  dev: {
    unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
    blockTime: 3000,
    requiredConfirmations: 6,
    locksmithHost: process.env.LOCKSMITH_URI || 'http://localhost:8080',
    readOnlyProvider: process.env.READ_ONLY_PROVIDER || 'http://localhost:8545',
  },
  test: {
    unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
    blockTime: 3000,
    requiredConfirmations: 6,
    locksmithHost: process.env.LOCKSMITH_URI || 'http://locksmith:8080',
    readOnlyProvider:
      process.env.READ_ONLY_PROVIDER || 'http://ganache-integration:8545',
  },
  staging: {
    unlockAddress: '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b',
    blockTime: 8000,
    requiredConfirmations: 12,
    locksmithHost: process.env.LOCKSMITH_URI,
    readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  },
  prod: {
    unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    blockTime: 8000,
    requiredConfirmations: 12,
    locksmithHost: process.env.LOCKSMITH_URI,
    readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  },
}

start(window, constants[process.env.UNLOCK_ENV]).catch(e => {
  console.error('startup error', e) // eslint-disable-line
})
