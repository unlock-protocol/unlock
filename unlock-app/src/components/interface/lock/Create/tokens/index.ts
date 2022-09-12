import { AVALANCHE } from './avalanche'
import { BSC } from './bsc'
import { GOERLI } from './goerli'
import { KOVAN } from './kovan'
import { MAINNET } from './mainnet'
import { MUMBAI } from './mumbai'
import { OPTIMISM } from './optimism'
import { POLYGON } from './polygon'
import { RINKEBY } from './rinkeby'

export interface Token {
  name: string
  address: string
  symbol: string
  decimals: number
  chainId: number
  logoURI?: string
}

// Array of all tokens
const TOKENS: Token[] = [
  ...AVALANCHE,
  ...BSC,
  ...GOERLI,
  ...KOVAN,
  ...MAINNET,
  ...MUMBAI,
  ...OPTIMISM,
  ...POLYGON,
  ...RINKEBY,
]

/**
 * Extract tokens list by network from list.
 * @param {network} number - network id
 * @return {Token} list of tokens by network
 */

export const getTokensByNetwork = (network: number): Token[] => {
  return TOKENS?.filter((token) => token.chainId === network)
}
