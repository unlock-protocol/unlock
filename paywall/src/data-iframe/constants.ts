declare var __ENVIRONMENT_VARIABLES__: any

// TODO FIND A WAY TO MOVE THIS IN A BETTER PLACE
// NOTE: NEVER PUT ENV VARS HERE
const constants: { [key: string]: any } = {
  dev: {
    unlockAddress: '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5',
    blockTime: 3000,
    requiredConfirmations: 6,
    defaultNetwork: 1984,
  },
  test: {
    unlockAddress: '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5',
    blockTime: 3000,
    requiredConfirmations: 6,
    defaultNetwork: 1984,
  },
  staging: {
    unlockAddress: '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b',
    blockTime: 8000,
    requiredConfirmations: 12,
    defaultNetwork: 4,
  },
  prod: {
    unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    blockTime: 8000,
    requiredConfirmations: 12,
    defaultNetwork: 1,
  },
}

const config = {
  ...__ENVIRONMENT_VARIABLES__,
  ...constants[__ENVIRONMENT_VARIABLES__.unlockEnv],
}

export default config
