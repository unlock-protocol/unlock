import utils from '../../utils'
import { getErc20Decimals } from '../../erc20'
import { ZERO } from '../../constants'

export default async (keyPrice, erc20Address, decimals, provider) => {
  let actualAmount
  if (decimals !== undefined && decimals !== null) {
    // We have have a keyPrice and decinals, we just use them.
    actualAmount = utils.toDecimal(keyPrice, decimals)
  } else {
    // get the decimals from the ERC20 contract or default to 18
    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, provider)
    } else {
      decimals = 18
    }
    actualAmount = utils.toDecimal(keyPrice, decimals)
  }
  return actualAmount
}
