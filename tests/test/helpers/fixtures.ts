import { ethers } from 'hardhat'
const { constants, utils } = ethers
import { DEFAULT_KEY_PRICE } from './keys'

export const lockParams = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  currencyContractAddress: constants.AddressZero, // address 0 is ETH but could be any ERC20 token
  keyPrice: DEFAULT_KEY_PRICE, // in wei
  maxNumberOfKeys: 100,
  name: 'Unlock-Protocol Sample Lock',
}
