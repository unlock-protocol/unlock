/**
 * This file maintains the concept of "supported" tokens on each
 * network. These are the addresses we will use to query for a user's
 * token balances with the Alchemy API.
` */

export const mainnet = {
  dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  sai: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  bat: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
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
