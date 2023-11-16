import { getSignerWhoIsKeyGranterOnLock } from '../fulfillment/dispatcher'

export const hasAuthorization = async (
  address: string,
  network: number
): Promise<boolean> => {
  const wallet = await getSignerWhoIsKeyGranterOnLock({
    lockAddress: address,
    network,
  })

  if (!wallet) {
    return false
  }

  return true
}

const AuthorizedLockOperations = {
  hasAuthorization,
}

export default AuthorizedLockOperations
