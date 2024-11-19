import { PublicLock } from '@unlock-protocol/contracts'
import { ethers } from 'ethers'
import config, { isProduction } from '../config/config'
import {
  getAllPurchasers,
  getProviderForNetwork,
  getPurchaser,
} from '../fulfillment/dispatcher'
import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { EVENT_CASTER_ADDRESS } from '../utils/constants'
import { LockMetadata } from '../models'
import logger from '../logger'
import { getWeb3Service } from '../initializers'

const DEFAULT_NETWORK = isProduction ? 8453 : 84532 // Base or Base Sepolia

const LOCK_DEPLOYER_ADDRESS = isProduction
  ? '0x9685F90FBd7F3b2120838762A673E0424d2d60fd'
  : '0xFd6Cf113fcDa14820531a7eF1Af992E64929EE19'

const LOCK_DEPLOYER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'unlock', type: 'address' },
      { internalType: 'uint16', name: 'version', type: 'uint16' },
      { internalType: 'bytes', name: 'params', type: 'bytes' },
      { internalType: 'bytes[]', name: 'transactions', type: 'bytes[]' },
    ],
    name: 'deployLockAndExecute',
    outputs: [
      { internalType: 'address', name: 'lockAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

// TODO: use unlockjs API when it's ready
export const deployLockForEventCaster = async ({
  title,
  hosts,
  eventId,
  imageUrl,
  description,
}: {
  title: string
  hosts: {
    verified_addresses: {
      eth_addresses: string[]
    }
  }[]
  eventId: string
  imageUrl: string
  description?: string | null
}) => {
  const [provider, wallet] = await Promise.all([
    getProviderForNetwork(DEFAULT_NETWORK),
    getPurchaser({ network: DEFAULT_NETWORK }),
  ])

  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)

  const lockProxyDeployer = new ethers.Contract(
    LOCK_DEPLOYER_ADDRESS,
    LOCK_DEPLOYER_ABI,
    wallet
  )

  // Deploy a new lock
  const lockInterface = new ethers.Interface(PublicLock.abi)

  const calldata = lockInterface.encodeFunctionData(
    'initialize(address,uint256,address,uint256,uint256,string)',
    [
      LOCK_DEPLOYER_ADDRESS, // first manager
      ethers.MaxUint256, // expirationDuration
      ethers.ZeroAddress, //currencyContractAddress
      0, // decimalKeyPrice
      0, // maxNumberOfKeys
      title, // lockName
    ]
  )

  const transactions = []
  const setLockMetadata = lockInterface.encodeFunctionData(
    'setLockMetadata(string,string,string)',
    [
      title,
      'EVENT',
      `https://events.xyz/api/v1/nft/unlock/${DEFAULT_NETWORK}/${eventId}/`,
    ]
  )
  transactions.push(setLockMetadata)

  const disableTransfers = lockInterface.encodeFunctionData(
    'updateTransferFee(uint256)',
    [10000]
  )
  transactions.push(disableTransfers)

  const addEventsXyzLockManager = lockInterface.encodeFunctionData(
    'addLockManager(address)',
    [EVENT_CASTER_ADDRESS]
  )
  transactions.push(addEventsXyzLockManager)

  const purchasers = await getAllPurchasers({ network: DEFAULT_NETWORK })
  await Promise.all(
    purchasers.map(async (purchaser) => {
      transactions.push(
        // Should we add as keyGranter?
        lockInterface.encodeFunctionData('addLockManager(address)', [
          await purchaser.getAddress(),
        ])
      )
    })
  )

  hosts.forEach((host) => {
    if (host.verified_addresses) {
      host.verified_addresses.eth_addresses.forEach((address: string) => {
        const addEventsOrganizerLockManager = lockInterface.encodeFunctionData(
          'addLockManager(address)',
          [address]
        )
        transactions.push(addEventsOrganizerLockManager)
      })
    }
  })

  const hostsAddresses = hosts.map(
    (host) => host.verified_addresses.eth_addresses[0]
  )
  const addHostsAsAttendees = lockInterface.encodeFunctionData(
    'grantKeys(address[],uint256[],address[])',
    [
      hostsAddresses,
      Array(hostsAddresses.length).fill(ethers.MaxUint256),
      hostsAddresses,
    ]
  )
  transactions.push(addHostsAsAttendees)

  const { hash } = await lockProxyDeployer.deployLockAndExecute(
    networks[DEFAULT_NETWORK].unlockAddress,
    14,
    calldata,
    transactions
  )
  const receipt = await provider.waitForTransaction(hash)

  if (!receipt) {
    throw new Error('No receipt')
  }

  const unlock = await walletService.getUnlockContract()
  const parsedLogs = receipt.logs
    .map((log: any) => unlock.interface.parseLog(log))
    .map((log: any) => log || {})

  const newLockEvent = parsedLogs.find(
    (log: any) => log.fragment && log.fragment.name === 'NewLock'
  )
  if (!newLockEvent) {
    throw new Error('No NewLock event')
  }

  const lockAddress = newLockEvent.args.newLockAddress

  // Save Lock Metadata!
  await LockMetadata.create({
    chain: DEFAULT_NETWORK,
    address: lockAddress,
    data: {
      description: description || 'Eventcaster event!',
      image: imageUrl,
      name: title,
    },
  })

  return {
    address: lockAddress,
    network: DEFAULT_NETWORK,
  }
}

export const getEventFormEventCaster = async (eventId: string) => {
  // make the request to @event api
  const eventCasterResponse = await fetch(
    `https://events.xyz/api/v1/event?event_id=${eventId}`
  )
  // parse the response and continue
  const { success, event } = await eventCasterResponse.json()

  if (!success) {
    return new Error('Could not retrieve event')
  }

  if (!(event.contract?.address && event.contract?.network)) {
    return new Error('This event does not have a contract attached.')
  }
  return event
}

export const mintNFTForRsvp = async ({
  ownerAddress,
  contract,
}: {
  ownerAddress: string
  contract: {
    address: string
    network: number
  }
}): Promise<{
  network: number
  address: string
  id: number
  owner: string
}> => {
  // Get the recipient

  const [provider, wallet] = await Promise.all([
    getProviderForNetwork(contract.network),
    getPurchaser({ network: contract.network }),
  ])

  // Check first if the user has a key
  const web3Service = getWeb3Service()
  const existingKey = await web3Service.getKeyByLockForOwner(
    contract.address,
    ownerAddress,
    contract.network
  )

  if (existingKey.tokenId > 0) {
    return {
      network: contract.network,
      address: contract.address,
      id: existingKey.tokenId,
      owner: ownerAddress,
    }
  }

  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)

  return await walletService.grantKey({
    lockAddress: contract.address,
    recipient: ownerAddress,
  })
}

export const saveContractOnEventCasterEvent = async ({
  eventId,
  address,
  network,
}: {
  eventId: string
  address: string
  network: number
}) => {
  const response = await fetch(
    `https://events.xyz/api/v1/unlock/update-event?event_id=${eventId}&address=${address}&network=${network}`,
    {
      method: 'POST',
      headers: {
        'x-api-key': `${config.eventCasterApiKey}`,
      },
      body: '',
    }
  )
  if (response.status !== 200) {
    const responseBody = await response.text()
    logger.error(
      'Failed to save contract on EventCaster',
      response.status,
      responseBody
    )
    return
  }
  const responseBody = await response.json()
  if (!responseBody.success) {
    logger.error('Failed to save contract on EventCaster', responseBody)
    return
  }
  return responseBody
}

export const saveTokenOnEventCasterRSVP = async ({
  eventId,
  farcasterId,
  tokenId,
}: {
  eventId: string
  farcasterId: number
  tokenId: number
}) => {
  const response = await fetch(
    `https://events.xyz/api/v1/unlock/update-rsvp?event_id=${eventId}&fid=${farcasterId}&token_id=${tokenId}`,
    {
      method: 'POST',
      headers: {
        'x-api-key': `${config.eventCasterApiKey}`,
      },
      body: '',
    }
  )
  const responseBody = await response.json()
  if (response.status !== 200) {
    const responseBody = await response.text()
    logger.error(
      'Failed to save RSVP on EventCaster',
      response.status,
      responseBody
    )
    return
  }
  return responseBody
}
