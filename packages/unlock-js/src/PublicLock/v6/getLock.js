import parseLockGetters from '../utils/parseLockGetters'

/**
 * Refresh the lock's data.
 * We use the block version
 * @return Promise<Lock>
 */
export default async function (address, provider) {
  const update = await parseLockGetters.bind(this)(address, provider)
  return update
}
