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

const TOKENS: Token[] = {
  ...AVALANCHE,
  ...BSC,
  ...GOERLI,
  ...KOVAN,
  ...MAINNET,
  ...MUMBAI,
  ...OPTIMISM,
  ...POLYGON,
  ...RINKEBY,
}

export const getTokensById = (network: number) => {
  return TOKENS.filter((token) => token.chainId === network)
}
