import { useQuery } from '@tanstack/react-query'
import { KeyOrderBy, OrderDirection } from '@unlock-protocol/unlock-js'
import dayjs from 'dayjs'
import { graphService } from '~/config/subgraph'
import { ADDRESS_ZERO, MAX_UINT } from '~/constants'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { rewriteIpfsUrl } from '~/utils/url'
import { useCallback, useEffect, useState } from 'react'

interface Options {
  lockAddress?: string
  owner?: string
  networks?: number[]
  showTestNets?: boolean
}

// Basic key type from the graph
export type BasicKey = {
  id: string
  tokenId: string
  lock: {
    address: string
    name?: string | null
    tokenAddress: string
    version: number
  }
  owner: string
  expiration: string
  network: number
  isExpired: boolean
  isRenewable: boolean
  isERC20: boolean
  isExtendable: boolean
}

// Fully loaded key type with all necessary data
export type FullyLoadedKey = BasicKey & {
  metadata: {
    image: string
    name: string
    [key: string]: any
  }
  transferFee: number
  lockData: {
    address: string
    name: string
    expirationDuration: number
    tokenAddress: string
    keyPrice: string
    maxNumberOfKeys: number
    owner: string
    totalSupply: number
    balance: string
    outstandingKeys: number
    publicLockVersion: number
    currencyContractAddress: string
    currencySymbol: string
    network: number
    [key: string]: any
  }
  receiptsPageUrl: string
  // Track loading states for progressive enhancement
  _isFullyLoaded: boolean
  _isMetadataLoading: boolean
  _isTransferFeeLoading: boolean
  _isLockDataLoading: boolean
  _isReceiptsUrlLoading: boolean
}

export type Key = FullyLoadedKey

export const useKeys = ({
  networks,
  lockAddress,
  owner,
  showTestNets,
}: Options) => {
  const web3Service = useWeb3Service()
  const [keys, setKeys] = useState<FullyLoadedKey[]>([])
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  // Query to fetch basic key data
  const { data: basicKeys, isPending: isBasicKeysLoading } = useQuery({
    queryKey: ['basic-keys', owner, networks, lockAddress, showTestNets],
    queryFn: async () => {
      // Fetch keys from the graph
      const keys = await graphService.keys(
        {
          first: 500,
          where: {
            lock: lockAddress?.toLowerCase(),
            owner: owner?.toLowerCase(),
          },
          orderBy: KeyOrderBy.Expiration,
          orderDirection: OrderDirection.Desc,
        },
        {
          networks,
        }
      )

      // Process keys with basic information
      const keysWithBasicInfo: BasicKey[] = keys.map((item) => {
        const isExpired =
          item.expiration !== MAX_UINT
            ? dayjs.unix(parseInt(item.expiration)).isBefore(dayjs())
            : false
        const isERC20 =
          item.lock.tokenAddress && item.lock.tokenAddress !== ADDRESS_ZERO

        const isExtendable =
          item.lock.version >= 11 && item.expiration !== MAX_UINT

        const isRenewable =
          item.lock.version >= 11 && item.expiration !== MAX_UINT && isERC20

        return {
          ...item,
          isExpired,
          isRenewable,
          isERC20,
          isExtendable,
        }
      })

      // Create initial keys with loading states
      const initialKeys: FullyLoadedKey[] = keysWithBasicInfo.map(
        (basicKey) => {
          return {
            ...basicKey,
            metadata: {
              image: '/images/svg/default-lock-logo.svg',
              name: basicKey.lock.name || 'NFT Membership',
            },
            transferFee: 0,
            lockData: {
              address: basicKey.lock.address,
              name: basicKey.lock.name || 'Unknown Lock',
              expirationDuration: 0,
              tokenAddress: basicKey.lock.tokenAddress,
              keyPrice: '0',
              maxNumberOfKeys: 0,
              owner: basicKey.owner,
              totalSupply: 0,
              balance: '0',
              outstandingKeys: 0,
              publicLockVersion: basicKey.lock.version,
              currencyContractAddress: '',
              currencySymbol: '',
              network: basicKey.network,
            },
            receiptsPageUrl: '',
            _isFullyLoaded: false,
            _isMetadataLoading: true,
            _isTransferFeeLoading: true,
            _isLockDataLoading: true,
            _isReceiptsUrlLoading: true,
          }
        }
      )

      return initialKeys
    },
  })

  // Function to load additional data for each key
  const loadAdditionalData = useCallback(
    async (basicKeys: FullyLoadedKey[]) => {
      if (!basicKeys || basicKeys.length === 0) return

      // Start loading each key's data in parallel
      const loadPromises = basicKeys.map(async (key, index) => {
        // Clone the key to avoid direct state mutations
        const updatedKey = { ...key }

        // Load metadata
        try {
          const tokenURI = await web3Service.tokenURI(
            key.lock.address,
            key.tokenId,
            key.network
          )

          const fetchedMetadata = await fetch(rewriteIpfsUrl(tokenURI)).then(
            (response) => response.json()
          )

          // Update the key with metadata
          updatedKey.metadata = {
            ...fetchedMetadata,
            image: rewriteIpfsUrl(fetchedMetadata.image),
          }
        } catch (error) {
          console.error(`Error loading metadata for key ${key.id}: ${error}`)
        }

        // Mark metadata as loaded
        updatedKey._isMetadataLoading = false

        // Update the state with the partially loaded key
        setKeys((prevKeys) => {
          const newKeys = [...prevKeys]
          // Only update if the key exists at this index
          if (index < newKeys.length) {
            newKeys[index] = { ...newKeys[index], ...updatedKey }
          }
          return newKeys
        })

        // Load transfer fee
        try {
          const fee = await web3Service.transferFeeBasisPoints(
            key.lock.address,
            key.network
          )
          updatedKey.transferFee = Number(fee)
        } catch (error) {
          console.error(
            `Error loading transfer fee for key ${key.id}: ${error}`
          )
        }

        // Mark transfer fee as loaded
        updatedKey._isTransferFeeLoading = false

        // Update the state again
        setKeys((prevKeys) => {
          const newKeys = [...prevKeys]
          if (index < newKeys.length) {
            newKeys[index] = { ...newKeys[index], ...updatedKey }
          }
          return newKeys
        })

        // Load lock data
        try {
          const fetchedLockData = await web3Service.getLock(
            key.lock.address,
            key.network
          )
          updatedKey.lockData = {
            ...fetchedLockData,
            network: key.network,
          }
        } catch (error) {
          console.error(`Error loading lock data for key ${key.id}: ${error}`)
        }

        // Mark lock data as loaded
        updatedKey._isLockDataLoading = false

        // Update the state again
        setKeys((prevKeys) => {
          const newKeys = [...prevKeys]
          if (index < newKeys.length) {
            newKeys[index] = { ...newKeys[index], ...updatedKey }
          }
          return newKeys
        })

        // Load receipts URL
        try {
          const keyData = await graphService.key(
            {
              where: {
                id: `${key.lock.address}-${key.tokenId}`,
                tokenId: key.tokenId,
              },
            },
            {
              network: key.network,
            }
          )

          if (keyData) {
            const url = new URL(
              `${typeof window !== 'undefined' ? window.location.origin : 'https://app.unlock-protocol.com'}/receipts`
            )
            url.searchParams.append('address', key.lock.address)
            url.searchParams.append('network', `${key.network}`)

            const hashes = keyData?.transactionsHash || []
            hashes.forEach((hash: string) => {
              url.searchParams.append('hash', hash)
            })

            updatedKey.receiptsPageUrl = url.toString()
          }
        } catch (error) {
          console.error(
            `Error loading receipts URL for key ${key.id}: ${error}`
          )
        }

        // Mark receipts URL as loaded
        updatedKey._isReceiptsUrlLoading = false
        updatedKey._isFullyLoaded = true

        // Final update with fully loaded key
        setKeys((prevKeys) => {
          const newKeys = [...prevKeys]
          if (index < newKeys.length) {
            newKeys[index] = { ...newKeys[index], ...updatedKey }
          }
          return newKeys
        })
      })

      // Wait for all keys to be fully loaded (but we've already updated the UI incrementally)
      await Promise.all(loadPromises)
    },
    [web3Service]
  )

  // Effect to trigger loading additional data when basic keys are available
  useEffect(() => {
    if (basicKeys && !isInitialLoadComplete) {
      setKeys(basicKeys)
      setIsInitialLoadComplete(true)
      loadAdditionalData(basicKeys)
    }
  }, [basicKeys, isInitialLoadComplete, loadAdditionalData])

  return {
    isKeysLoading: isBasicKeysLoading && !isInitialLoadComplete,
    keys,
  }
}
