import parseLockGetters from '../utils/parseLockGetters'
import { getAllowance } from '../../erc20'

/**
 * Refresh the lock's data.
 * We use the block version
 * @return Promise<Lock>
 */
export default async function (address, provider) {
  const update = await parseLockGetters.bind(this)(address, provider)

  // get lock allowance of itself (for v10 recurring)
  const erc20LockAllowance = await getAllowance(
    update.tokenAddress,
    address,
    provider,
    address
  )

  // fix for a bug in reccuring ERC20 payments on lock v10
  update.selfAllowance = erc20LockAllowance.toString()

  return update
}
