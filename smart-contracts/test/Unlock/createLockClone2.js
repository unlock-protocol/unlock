const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const unlockContract = artifacts.require('../Unlock.sol')
const getProxy = require('../helpers/proxy')
const WalletService = require('../helpers/walletServiceMock.js')

let unlock

contract('Unlock / createLockClone2', accounts => {})
