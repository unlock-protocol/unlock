import * as request from 'request-promise-native'
import { ethers } from 'ethers'
import * as DeployedLocks from './deployedLocks'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

// eslint-disable-next-line import/prefer-default-export
export async function keys(address: string) {
  let network = 'rinkeby'
  if (
    config.unlockContractAddress &&
    config.unlockContractAddress.toLowerCase() ==
      '0x3d5409cce1d45233de1d4ebdee74b8e004abdd13'
  ) {
    network = 'homestead'
  }

  let locks = await DeployedLocks.deployedLocks(
    config.unlockContractAddress,
    network
  )
  return getKeyOwnerships(address, locks)
}

async function getKeyOwnerships(keyOwner: string, locks: string[]) {
  let formData = {
    jsonrpc: '2.0',
    method: 'alchemy_getTokenBalances',
    params: [keyOwner, locks],
    id: '42',
  }

  let options = {
    method: 'POST',
    url: config.web3ProviderHost,
    headers: { 'Content-Type': 'application/json' },
    form: JSON.stringify(formData),
  }

  let ownership = await request.post(options)
  let parsedOwnership = JSON.parse(ownership)
  let balances = parsedOwnership['result']['tokenBalances']

  return balances
    .filter((balance: any) => {
      let tokenBalance = ethers.utils.bigNumberify(balance.tokenBalance)
      return balance.error == null && tokenBalance.gt(0)
    })
    .map((balance: any) => balance.contractAddress)
}
