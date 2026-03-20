import { Contract, Interface, type InterfaceAbi, JsonRpcProvider } from 'ethers'
import { cache } from 'react'
import { UPGovernor, UPToken } from '@unlock-protocol/contracts'
import { governanceConfig } from '~/config/governance'

const governorAbi = getContractAbi(UPGovernor)
const tokenAbi = getContractAbi(UPToken)

export const getRpcProvider = cache(
  () => new JsonRpcProvider(governanceConfig.rpcUrl, governanceConfig.chainId)
)

export const getGovernorContract = cache(
  () =>
    new Contract(
      governanceConfig.governorAddress,
      governorAbi,
      getRpcProvider()
    )
)

export const getGovernorInterface = cache(() => new Interface(governorAbi))

export const getTokenContract = cache(
  () => new Contract(governanceConfig.tokenAddress, tokenAbi, getRpcProvider())
)

export const getTokenSymbol = cache(async () => {
  return (await getTokenContract().symbol()) as string
})

export const getBlockTimestamp = cache(async (blockNumber: number) => {
  const block = await getRpcProvider().getBlock(blockNumber)

  if (!block) {
    throw new Error(`Missing block ${blockNumber}`)
  }

  return BigInt(block.timestamp)
})

export const getLatestTimestamp = cache(async () => {
  const block = await getRpcProvider().getBlock('latest')

  if (!block) {
    throw new Error('Unable to load latest block')
  }

  return BigInt(block.timestamp)
})

function getContractAbi(abi: unknown): InterfaceAbi {
  if (abi && typeof abi === 'object' && 'abi' in abi) {
    return (abi as { abi: InterfaceAbi }).abi
  }

  return abi as InterfaceAbi
}
