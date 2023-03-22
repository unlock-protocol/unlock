import { Op } from 'sequelize'
import { networks } from '@unlock-protocol/networks'
import { Key } from '../../graphql/datasource'
import { Hook, ProcessedHookItem, UserTokenMetadata } from '../../models'
import { TOPIC_KEYS_ON_LOCK, TOPIC_KEYS_ON_NETWORK } from '../topics'
import { notifyHook, filterHooksByTopic } from '../helpers'
import {
  notifyNewKeysToWedlocks,
  sendEmail,
} from '../../operations/wedlocksOperations'
import { logger } from '../../logger'
import { SubgraphService, Web3Service } from '@unlock-protocol/unlock-js'
import * as Normalizer from '../../utils/normalizer'
import { ethers } from 'ethers'
import dayjs from 'dayjs'

const FETCH_LIMIT = 25
const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

async function fetchUnprocessedKeys(network: number, page = 0) {
  const keySource = new Key(network)
  const keys = await keySource.getKeys({
    first: FETCH_LIMIT,
    skip: page ? page * FETCH_LIMIT : 0,
  })

  const keyIds = keys.map((key: any) => key.id)
  const processedKeys = await ProcessedHookItem.findAll({
    where: {
      objectId: {
        [Op.in]: keyIds,
      },
    },
  })

  const unprocessedKeys = keys.filter(
    (key: any) => !processedKeys.find((item) => item.objectId === key.id)
  )
  return unprocessedKeys
}

async function notifyHooksOfAllUnprocessedKeys(hooks: Hook[], network: number) {
  let page = 0
  const keysOnLockHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_LOCK)
  const keysOnNetworkHooks = filterHooksByTopic(hooks, TOPIC_KEYS_ON_NETWORK)
  while (true) {
    const keys = await fetchUnprocessedKeys(network, page)

    // If empty, break the loop and return as there are no more new keys to process.
    if (!keys.length) {
      logger.info('No new keys for', { network })
      break
    }
    logger.info('Found new keys', {
      keys: keys.map((key: any) => [network, key.lock.address, key.id]),
    })

    await Promise.allSettled([
      notifyNewKeysToWedlocks(keys, network), // send emails when applicable!
      // Send notification to hooks subscribed to keys on a specific lock address
      ...keysOnLockHooks.map(async (keysOnLockHook) => {
        const data = keys.filter(
          (key: any) => key.lock.id === keysOnLockHook.lock
        )
        const hookEvent = await notifyHook(keysOnLockHook, {
          data,
          network,
        })
        return hookEvent
      }),
      // Send notification to hooks subscribed to keys on a whole network
      ...keysOnNetworkHooks.map(async (keysOnNetworkHook) => {
        const hookEvent = await notifyHook(keysOnNetworkHook, {
          network,
          data: keys,
        })
        return hookEvent
      }),
    ])

    const processedHookItems = keys.map((key: any) => {
      return {
        network,
        type: 'key',
        objectId: key.id,
      }
    })

    await ProcessedHookItem.bulkCreate(processedHookItems)

    page += 1
  }
}

export async function notifyOfKeys(hooks: Hook[]) {
  const tasks: Promise<void>[] = []

  for (const network of Object.values(networks)) {
    if (network.id !== 31337) {
      const hooksFilteredByNetwork = hooks.filter(
        (hook) => hook.network === network.id
      )
      const task = notifyHooksOfAllUnprocessedKeys(
        hooksFilteredByNetwork,
        network.id
      )
      tasks.push(task)
    }
  }

  await Promise.allSettled(tasks)
}

export async function notifyKeyExpiration() {
  const web3Service = new Web3Service(networks)

  const now = new Date()

  const end = new Date(now.getTime())
  end.setDate(now.getDate() + 1)

  await Promise.allSettled(
    // get expiring keys for every network
    Object.keys(networks).map(async (networkId: string) => {
      const subgraph = new SubgraphService()
      // get keys from now to 24h in the future
      const keys = await subgraph.keys(
        {
          first: 1000, // more than 1000 limit? need to handle it
          where: {
            expiration_gt: now.getTime().toString(),
            expiration_lt: end.getTime().toString(),
          },
        },
        {
          networks: [Number(networkId)],
        }
      )

      await Promise.allSettled([
        keys?.map(async (key: any) => {
          const lockName = key?.lock?.name ?? ''
          const lockAddress = Normalizer.ethereumAddress(key.lock.address)
          const ownerAddress = Normalizer.ethereumAddress(key.owner)
          const tokenAddress = key?.lock?.tokenAddress ?? ''
          const keyId = key?.tokenId ?? ''

          const userTokenMetadataRecord = await UserTokenMetadata.findOne({
            where: {
              tokenAddress: lockAddress,
              userAddress: ownerAddress,
            },
          })

          const protectedData = Normalizer.toLowerCaseKeys({
            ...userTokenMetadataRecord?.data?.userMetadata?.protected,
          })

          const recipient = protectedData?.email as string

          if (!recipient) return

          const isERC20 =
            tokenAddress && tokenAddress !== ethers.constants.AddressZero

          const isRenewable =
            Number(key?.lock?.version) >= 11 &&
            key.expiration !== MAX_UINT &&
            isERC20

          const currency = isERC20
            ? (await web3Service.getTokenSymbol(
                tokenAddress,
                Number(networkId)
              )) ?? ''
            : networks?.[networkId]?.baseCurrencySymbol

          const addressBalance =
            web3Service.getAddressBalance(ownerAddress, Number(networkId)) ?? 0

          const isAutoRenewable =
            parseFloat(Number(addressBalance).toString()) >
            parseFloat(key?.lock?.price)

          // expiration date example: 1 December 2022 - 10:55
          const expirationDate = dayjs(new Date(key.expiration)).format(
            'D MMMM YYYY - HH:mm'
          )

          // send expiring email
          await sendEmail(`keyExpiring`, `keyExpiring`, recipient, {
            lockName,
            keyId,
            network: networkId,
            currency,
            expirationDate,
            keychainUrl: 'https://app.unlock-protocol.com/keychain',
            isRenewable: isRenewable && !isAutoRenewable ? 'true' : '',
            isAutoRenewable: isAutoRenewable ? 'true' : '',
            isRenewableIfRePurchased: '',
            isRenewableIfReApproved: '',
          })
        }),
      ])
    })
  )
}

export async function notifyKeyExpired() {
  const now = new Date()

  const yesterday = new Date(now.getTime())
  yesterday.setDate(now.getDate() - 1)

  await Promise.allSettled(
    // get expiring keys for every network
    Object.keys(networks).map(async (networkId: string) => {
      const subgraph = new SubgraphService()
      // get keys from now to 24h before
      const keys = await subgraph.keys(
        {
          first: 1000, // more than 1000 limit? need to handle it
          where: {
            expiration_lt: now.getTime().toString(),
            expiration_gt: yesterday.getTime().toString(),
          },
        },
        {
          networks: [Number(networkId)],
        }
      )

      await Promise.allSettled(
        keys?.map(async (key: any) => {
          const lockName = key?.lock?.name ?? ''
          const lockAddress = Normalizer.ethereumAddress(key.lock.address)
          const ownerAddress = Normalizer.ethereumAddress(key.owner)
          const keyId = key?.tokenId ?? ''

          const userTokenMetadataRecord = await UserTokenMetadata.findOne({
            where: {
              tokenAddress: lockAddress,
              userAddress: ownerAddress,
            },
          })

          const protectedData = Normalizer.toLowerCaseKeys({
            ...userTokenMetadataRecord?.data?.userMetadata?.protected,
          })

          const recipient = protectedData?.email as string

          if (!recipient) return

          // send expiring email
          await sendEmail(`keyExpired`, `keyExpired`, recipient, {
            lockName,
            keyId,
            network: networkId,
            keychainUrl: 'https://app.unlock-protocol.com/keychain',
          })
        })
      )
    })
  )
}
