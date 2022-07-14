import ApolloClient from 'apollo-boost'
import { utils } from 'ethers'
import locksByManager from '../queries/locksByManager'
import keyHoldersByLocks from '../queries/keyholdersByLock'
import { ToastHelper } from '../components/helpers/toast.helper'
import keyholdersByKeyIdQuery from '../queries/keyholdersByKeyId'
import { getValidNumber } from '~/utils/strings'
export class GraphService {
  public client: any

  connect(uri: string) {
    this.client = new ApolloClient({
      uri,
    })
  }

  locksByManager = async (owner: string) => {
    const query = locksByManager()
    try {
      const result = await this.client.query({
        query,
        variables: {
          owner,
        },
      })

      // TODO: map fields so that we get the same output values than unlock-js (keyPrice should use decimals... etc)

      // the Graph returns lower cased addresses.
      // To make sure we stay consistent with the rest of the app
      // We use checksumed addresses.
      return result.data.lockManagers.map((manager: any) => {
        return {
          ...manager.lock,
          address: utils.getAddress(manager.lock.address),
        }
      })
    } catch (error) {
      console.error(error)
      ToastHelper.error(
        'We could not load your locks. Please retry and let us know if that keeps failing'
      )
      return []
    }
  }

  keysByLocks = async (
    locks: string[],
    expiresAfter: number,
    first: number,
    skip: number,
    search: string | number,
    filterKey: string
  ) => {
    const query =
      filterKey === 'owner' ? keyHoldersByLocks() : keyholdersByKeyIdQuery()

    const keyId = getValidNumber(search)

    const owner = `${search}`?.toLowerCase() ?? ''

    const result = await this.client.query({
      query,
      variables: {
        addresses: locks,
        expiresAfter,
        first,
        skip,
        owner,
        keyId,
      },
    })
    return result
  }
}

export default GraphService
