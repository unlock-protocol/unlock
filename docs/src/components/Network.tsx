'use client'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from '@unlock-protocol/ui'
import { useQuery } from '@tanstack/react-query'
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatUnits,
  ZeroAddress,
  ethers,
} from 'ethers'
import { useEffect, useState } from 'react'
import React from 'react'

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

const UNLOCK_ABI = [
  {
    inputs: [],
    name: 'udt',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]

interface Token {
  address?: string
  symbol: string
  decimals: number
}

interface Network {
  id: number
  chainId: number
  name: string
  description?: string
  provider: string
  unlockAddress: string
  unlockDaoToken?: Token
  dao?: boolean
  nativeCurrency: {
    symbol: string
    decimals: number
  }
  tokens: Token[]
  explorer: {
    urls: {
      address: (address: string) => string
      transaction: (hash: string) => string
      token: (address: string, holderAddress?: string) => string
    }
  }
}

const getBalance = async (
  provider: JsonRpcProvider,
  contractAddress: string | undefined,
  ownerAddress: string
): Promise<string> => {
  if (!contractAddress || !ownerAddress) {
    return ''
  }
  const contract = new Contract(contractAddress, ERC20_ABI, provider)
  const balance = await contract.balanceOf(ownerAddress)
  const decimals = await contract.decimals()
  const symbol = await contract.symbol()
  return `${Number(formatUnits(balance, decimals)).toFixed(2)} ${symbol}`
}

const getUdt = async (
  provider: JsonRpcProvider,
  unlockAddress: string
): Promise<string> => {
  if (!unlockAddress) {
    return ''
  }
  const contract = new Contract(unlockAddress, UNLOCK_ABI, provider)
  const udt = await contract.udt()
  return udt
}

const getSymbol = async (provider, tokenAddress) => {
  if (!tokenAddress) {
    return ''
  }
  const contract = new Contract(tokenAddress, ERC20_ABI, provider)
  return await contract.symbol()
}

const getProtocolFee = async (provider, unlockAddress) => {
  const contract = new Contract(
    unlockAddress,
    ['function protocolFee() view returns (uint256)'],
    provider
  )
  const fee = await contract.protocolFee()
  return `${(Number(fee) / 100).toFixed(2)}%`
}

const getBalances = async (
  provider,
  network,
  nativeCurrency,
  tokens,
  ownerAddress
) => {
  const balances = await Promise.all([
    ...tokens
      .filter((token) => {
        // Excluding UDT/UP
        return (
          token.address !== network.unlockDaoToken?.address &&
          token.symbol !== 'UDT' &&
          token.symbol !== 'UP'
        )
      })
      .map(async (token) => {
        const contract = new Contract(token.address, ERC20_ABI, provider)
        return {
          token,
          balance: await contract.balanceOf(ownerAddress).catch(() => {
            console.error(
              `Could not get balance for ${token.address} on ${network.name}`
            )
          }),
        }
      }),
    {
      token: {
        symbol: nativeCurrency.symbol,
        decimals: nativeCurrency.decimals,
      },
      balance: await provider.getBalance(ownerAddress).catch(() => 0),
    },
  ])
  return balances.filter(({ balance }) => balance > 0)
}

// Add types to component props
interface BurnableTokenProps {
  network: Network
  token: Token
  balance: bigint
  reload: () => void
}

const BurnableToken = ({
  network,
  token,
  balance,
  reload,
}: BurnableTokenProps) => {
  const [hash, setHash] = useState('')
  const [burnTx, setBurnTx] = useState(null)
  const [burning, setBurning] = useState(false)
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()

  const prepareBurnTx = async () => {
    const provider = new JsonRpcProvider(network.provider, network.chainId, {})

    const unlock = new Contract(
      network.unlockAddress,
      [
        {
          inputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint24', name: 'poolFee', type: 'uint24' },
          ],
          name: 'swapAndBurn',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [],
          name: 'swapBurnerAddress',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      provider
    )

    const addressOfTokenToBurn = token.address || ethers.ZeroAddress
    let tx

    if (addressOfTokenToBurn === ethers.ZeroAddress) {
      try {
        tx = await unlock.swapAndBurn.populateTransaction(
          token.address || ethers.ZeroAddress,
          balance,
          3000 // No need to enter a pool fee for native currency
        )
      } catch (e) {
        console.error(e)
      }
    } else {
      const fees = [500, 3000, 10000]
      for (const fee of fees) {
        if (!tx) {
          try {
            tx = await unlock.swapAndBurn.populateTransaction(
              token.address || ethers.ZeroAddress,
              balance,
              fee // pool for the token, not for UDT/UP
            )
          } catch (e) {
            console.error(e)
          }
        }
      }
    }
    try {
      const gas = await provider.estimateGas(tx)
      setBurnTx(tx)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    prepareBurnTx()
  }, [])

  const burn = async () => {
    if (!authenticated) {
      login()
      setBurning(true)
    } else {
      // Get a signer
      const provider = new BrowserProvider(
        await wallets[0].getEthereumProvider()
      )
      const signer = await provider.getSigner()

      // switch network
      await provider.send('wallet_switchEthereumChain', [
        {
          chainId: `0x${network.id.toString(16)}`,
        },
      ])

      if (burnTx) {
        try {
          const transaction = await signer.sendTransaction(burnTx)
          setHash(transaction.hash)
          await transaction.wait()
        } catch (error) {
          console.error(error)
          // TODO: replace with Toast once we have UI package
          alert('The transaction to burn tokens could not be sent.')
        }
        await reload()
        setBurning(false)
      } else {
        // TODO: replace with Toast once we have UI package
        alert('We could find a way to burn this token.')
      }
      setBurning(false)
    }
  }

  useEffect(() => {
    if (burning && authenticated) {
      // resume burning!
      burn()
    }
  }, [burning, authenticated])

  return (
    <li className="flex items-center">
      <span>
        {Number(formatUnits(balance, token.decimals)).toFixed(4)} {token.symbol}
      </span>
      {burnTx && (
        <Button onClick={burn} className="ml-2" size="tiny">
          Burn
        </Button>
      )}{' '}
      {hash && (
        <a href={network.explorer.urls.transaction(hash)} target="_blank">
          Transaction
        </a>
      )}
    </li>
  )
}

// Add types to component props
interface BurnableTokensProps {
  network: Network
}

const BurnableTokens = ({ network }: BurnableTokensProps) => {
  const provider = new JsonRpcProvider(network.provider, network.chainId, {
    batchMaxCount: 10,
  })

  const { data: balances, refetch } = useQuery({
    queryKey: ['getBalances', network.tokens, network.unlockAddress],
    queryFn: () => {
      return getBalances(
        provider,
        network,
        network.nativeCurrency,
        network.tokens,
        network.unlockAddress
      )
    },
  })
  if (!balances || balances.length === 0) {
    return null
  }

  return (
    <li className="space-y-2">
      <a href="/governance/unlock-dao-tokens#swap-and-burn">Burnable tokens</a>{' '}
      <a href="#footnote-1">[1]</a>:{' '}
      <ul className="space-y-2">
        {balances.map(({ token, balance }) => {
          return (
            <BurnableToken
              reload={refetch}
              network={network}
              key={token.address}
              token={token}
              balance={balance}
            />
          )
        })}
      </ul>
    </li>
  )
}

interface BurnedTokensProps {
  network: Network
}

const BurnedTokens = ({ network }: BurnedTokensProps) => {
  const burnAddress = '0x000000000000000000000000000000000000dEaD'
  const provider = new JsonRpcProvider(network.provider)
  const { data: burnedTokens } = useQuery({
    queryKey: ['getBalance', network.unlockDaoToken?.address, burnAddress],
    queryFn: () => {
      return getBalance(provider, network.unlockDaoToken?.address, burnAddress)
    },
    enabled: !!network.unlockDaoToken?.address,
  })
  if (!burnedTokens) {
    return null
  }
  return (
    <li>
      Burned Governance Tokens :{' '}
      <a
        href={network.explorer.urls.token(
          network.unlockDaoToken?.address || '',
          burnAddress
        )}
        target="_blank"
      >
        {burnedTokens}
      </a>
    </li>
  )
}

interface SupportedNetworkProps {
  network: Network
}

export const SupportedNetwork = ({ network }: SupportedNetworkProps) => {
  const provider = new JsonRpcProvider(network.provider)
  const { data: udtBalance } = useQuery({
    queryKey: [
      'getBalance',
      network.unlockDaoToken?.address,
      network.unlockAddress,
    ],
    queryFn: () => {
      return getBalance(
        provider,
        network.unlockDaoToken?.address,
        network.unlockAddress
      )
    },
    enabled: !!network.unlockDaoToken?.address,
  })

  const { data: protocolFee } = useQuery({
    queryKey: ['protocolFee', network.unlockAddress],
    queryFn: () => {
      return getProtocolFee(provider, network.unlockAddress)
    },
  })

  if (network.name === 'localhost') {
    return null
  }
  return (
    <div key={network.id} style={{ marginBottom: '30px' }}>
      <h2>{network.name}</h2>
      <p>{network.description}</p>
      <ul>
        <li>
          Unlock address:{' '}
          <a href={network.explorer.urls.address(network.unlockAddress)}>
            {network.unlockAddress}
          </a>
        </li>
        <li>
          <a href="/governance/unlock-dao/cross-chain-governance">
            Controlled by the DAO
          </a>
          : {network.dao ? '✅' : '❌'}
        </li>
        <li>
          <a href="/governance/unlock-dao-tokens#earning-up-token-rewards">
            Protocol Reward
          </a>
          :{' '}
          {udtBalance && parseFloat(udtBalance) > 0
            ? `✅ ${udtBalance} to be distributed`
            : '❌'}
        </li>
        <li>
          <a href="/governance/unlock-dao-tokens#protocol-fee">Protocol Fee</a>:{' '}
          {protocolFee}
        </li>
        <BurnableTokens network={network} />
        <BurnedTokens network={network} />
      </ul>
    </div>
  )
}

interface TokenNetworkProps {
  network: Network
}

export const TokenNetwork = ({ network }: TokenNetworkProps) => {
  const provider = new JsonRpcProvider(network.provider)
  const { data: udt } = useQuery({
    queryKey: ['getUdt', network.unlockAddress, network.id],
    queryFn: async () => {
      return getUdt(provider, network.unlockAddress)
    },
    enabled: !!network.unlockAddress,
  })

  const { data: symbol } = useQuery({
    queryKey: ['getSymbol', network.unlockAddress, udt],
    queryFn: async () => {
      if (!udt || udt === ZeroAddress) return null
      return getSymbol(provider, udt)
    },
    enabled: !!udt && udt !== ZeroAddress,
  })

  if (network.name === 'localhost') {
    return null
  }
  if (udt === ZeroAddress) {
    return null
  }

  return (
    <tr>
      <td>{network.name}</td>
      <td>{symbol}</td>
      <td>
        <a target="_blank" href={network.explorer.urls.token(udt!)}>
          <code>{udt}</code>
        </a>
      </td>
    </tr>
  )
}
