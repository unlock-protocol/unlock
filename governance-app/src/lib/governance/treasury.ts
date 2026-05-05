import { Contract, type InterfaceAbi } from 'ethers'
import { cache } from 'react'
import { base } from '@unlock-protocol/networks'
import { governanceConfig } from '~/config/governance'
import { getRpcProvider } from './rpc'

const erc20Abi = [
  {
    constant: true,
    inputs: [
      {
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies InterfaceAbi

export type TreasuryAsset = {
  address: string
  balance: bigint
  decimals: number
  isNative: boolean
  name: string
  symbol: string
}

export type TreasuryOverview = {
  assets: TreasuryAsset[]
  timelockAddress: string
}

export const getTreasuryOverview = cache(
  async (): Promise<TreasuryOverview> => {
    const provider = getRpcProvider()
    const tokenAssets = (base.tokens || []).filter(
      (token) => !!token.address && typeof token.decimals === 'number'
    )

    const [ethBalance, tokenBalances] = await Promise.all([
      provider.getBalance(governanceConfig.timelockAddress),
      Promise.all(
        tokenAssets.map(async (token) => {
          const contract = new Contract(token.address, erc20Abi, provider)
          const balance = (await contract.balanceOf(
            governanceConfig.timelockAddress
          )) as bigint

          return {
            address: token.address,
            balance,
            decimals: token.decimals,
            isNative: false,
            name: token.name,
            symbol: token.symbol,
          } satisfies TreasuryAsset
        })
      ),
    ])

    const assets = [
      {
        address: governanceConfig.timelockAddress,
        balance: ethBalance,
        decimals: base.nativeCurrency.decimals,
        isNative: true,
        name: base.nativeCurrency.name,
        symbol: base.nativeCurrency.symbol,
      } satisfies TreasuryAsset,
      ...tokenBalances.filter((asset) => asset.balance > 0n),
    ]

    return {
      assets,
      timelockAddress: governanceConfig.timelockAddress,
    }
  }
)
