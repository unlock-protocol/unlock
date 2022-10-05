/**
 * This file maintains the concept of "supported" tokens on each
 * network. These are the addresses we will use to query for a user's
 * token balances with the Alchemy API.
` */

export const mainnet = {
  dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
  sai: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  bat: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
}

export const kovan = {
  weenus: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
}

// localDev is a special case, we won't have access to the Alchemy API
// there, so we'll have to think about how to handle that moving
// forward.
export const localDev = {}

const table: { [key: number]: { [key: string]: string } } = {
  1: mainnet,
  42: kovan,
  1337: localDev,
}

export const tokenAddressesForNetwork = (networkId: number) => {
  return table[networkId]
}
