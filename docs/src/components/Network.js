import { usePrivy, useWallets } from '@privy-io/react-auth'
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

const getBalance = async (provider, contractAddress, ownerAddress) => {
  if (!contractAddress || !ownerAddress) {
    return ''
  }
  const contract = new Contract(contractAddress, ERC20_ABI, provider)
  const balance = await contract.balanceOf(ownerAddress)
  const decimals = await contract.decimals()
  const symbol = await contract.symbol()
  return `${Number(formatUnits(balance, decimals)).toFixed(2)} ${symbol}`
}

const getUdt = async (provider, unlockAddress) => {
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

const getName = async (provider, tokenAddress) => {
  if (!tokenAddress) {
    return ''
  }
  const contract = new Contract(tokenAddress, ERC20_ABI, provider)
  return await contract.name()
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

const getBalances = async (provider, nativeCurrency, tokens, ownerAddress) => {
  const balances = await Promise.all([
    ...tokens.map(async (token) => {
      const contract = new Contract(token.address, ERC20_ABI, provider)
      return {
        token,
        balance: await contract.balanceOf(ownerAddress).catch(() => 0),
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

const BurnableToken = ({ network, token, balance }) => {
  const [burning, setBurning] = useState(false)
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()

  const burn = async () => {
    if (!authenticated) {
      login()
      setBurning(true)
    } else {
      // switch network
      await wallets[0].switchChain(network.id)

      const provider = await wallets[0].getEthersProvider()
      // Send tx
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
      console.log(unlock)
      console.log(await unlock.swapBurnerAddress())
      console.log('GO!')
      const tx = await unlock.swapAndBurn.populateTransaction(
        token.address || ethers.ZeroAddress,
        1, // burn 1 token
        3000,
        { value: 0 }
      )
      console.log(tx)
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
    <li>
      {Number(formatUnits(balance, token.decimals)).toFixed(2)} {token.symbol}{' '}
      <button onClick={burn}>Burn</button>
    </li>
  )
}

const BurnableTokens = ({ network }) => {
  const provider = new JsonRpcProvider(network.provider, network.chainId, {
    batchMaxCount: 10,
  })

  const { data: balances } = useQuery({
    queryKey: ['getBalances', network.tokens, network.unlockAddress],
    queryFn: () => {
      return getBalances(
        provider,
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
    <li>
      <a href="/governance/unlock-dao-tokens#swap-and-burn">Burnable tokens</a>:{' '}
      <ul>
        {balances.map(({ token, balance }) => {
          if (token.symbol === 'UDT' || token.symbol === 'UP') {
            return
          }
          return (
            <BurnableToken
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

const BurnedTokens = ({ network }) => {
  const provider = new JsonRpcProvider(network.provider)
  const { data: burnedTokens } = useQuery({
    queryKey: [
      'getBalance',
      network.unlockDaoToken?.address,
      '0x000000000000000000000000000000000000dEaD',
    ],
    queryFn: () => {
      return getBalance(
        provider,
        network.unlockDaoToken?.address,
        '0x000000000000000000000000000000000000dEaD'
      )
    },
    enabled: !!network.unlockDaoToken?.address,
  })
  if (!burnedTokens) {
    return null
  }
  return (
    <li>
      <a href="/governance/unlock-dao-tokens#swap-and-burn">
        Burned Governance Tokens
      </a>
      : {burnedTokens}
    </li>
  )
}

export const SupportedNetwork = ({ network }) => {
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
    <div key={network.id} style={{ 'margin-bottom': '30px' }}>
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
          <a href="/governance/unlock-dao-tokens#earning-udt">
            Protocol Reward
          </a>
          :{' '}
          {parseFloat(udtBalance) > 0
            ? `✅ ${udtBalance} to be distributed`
            : '❌'}
        </li>
        <BurnedTokens network={network} />
        <li>Protocol Fee: {protocolFee}</li>
        <BurnableTokens network={network} />
      </ul>
    </div>
  )
}

export const TokenNetwork = ({ network }) => {
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
      return getSymbol(provider, udt)
    },
    enabled: udt && udt !== ZeroAddress,
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
        <a target="_blank" href={network.explorer.urls.token(udt)}>
          <code>{udt}</code>
        </a>
      </td>
    </tr>
  )
}

// export const Network = ({ network }) => {
//   return (
//   )
// }
