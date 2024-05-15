import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { getCheckoutConfigById } from '../operations/checkoutConfigOperations'
import { getEventBySlug } from '../operations/eventOperations'
import { isEmpty } from 'lodash'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'

export const isEventOrganizer = async (address: string, slug: string) => {
  const web3Service = new Web3Service(networks)
  let locks: PaywallLocksConfigType = {}

  // If this is an existing event!
  if (slug) {
    const existingEvent = await getEventBySlug(
      slug,
      false /** includeProtected */
    )
    if (existingEvent?.checkoutConfigId) {
      const checkoutConfig = await getCheckoutConfigById(
        existingEvent.checkoutConfigId
      )
      locks = checkoutConfig?.config.locks || {}
    }
  }

  if (isEmpty(locks)) {
    return undefined
  }

  const lockManagers = await Promise.all(
    Object.keys(locks).map((lockAddress: string) => {
      const networkId = locks[lockAddress].network
      return web3Service.isLockManager(lockAddress, address, Number(networkId))
    })
  )
  return lockManagers.some((isManager) => isManager)
}
