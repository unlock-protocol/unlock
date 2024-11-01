import { PublicLock } from '@unlock-protocol/contracts'
import { ethers } from 'ethers'
import { isProduction } from '../config/config'
import { getProviderForNetwork, getPurchaser } from '../fulfillment/dispatcher'
import networks from '@unlock-protocol/networks'
import { WalletService } from '@unlock-protocol/unlock-js'
import { EVENT_CASTER_ADDRESS } from '../utils/constants'

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
}: {
  title: string
  hosts: any[]
  eventId: string
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
      'TKT',
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

  const receipt = await (
    await lockProxyDeployer.deployLockAndExecute(
      networks[DEFAULT_NETWORK].unlockAddress,
      14,
      calldata,
      transactions
    )
  ).wait()

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

  return {
    address: newLockEvent.args.newLockAddress,
    network: DEFAULT_NETWORK,
  }
}
