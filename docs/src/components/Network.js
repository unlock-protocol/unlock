import { useQuery } from '@tanstack/react-query'
import { JsonRpcProvider, Contract, formatUnits } from 'ethers'

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint256)',
  'function symbol() view returns (string)',
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
        balance: await contract.balanceOf(ownerAddress),
      }
    }),
    {
      token: {
        symbol: nativeCurrency.symbol,
        decimals: nativeCurrency.decimals,
      },
      balance: await provider.getBalance(ownerAddress),
    },
  ])
  return balances.filter(({ balance }) => balance > 0)
}

const BurnableTokens = ({ network }) => {
  const provider = new JsonRpcProvider(
    network.publicProvider,
    network.chainId,
    {
      batchMaxCount: 10,
    }
  )

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
      {balances
        .map(({ token, balance }) => {
          return `${Number(formatUnits(balance, token.decimals)).toFixed(2)} ${token.symbol}`
        })
        .join(', ')}
    </li>
  )
}

const Network = ({ network }) => {
  console.log(network)
  const provider = new JsonRpcProvider(network.publicProvider)
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
  console.log({ udtBalance })
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
        <li>Protocol Fee: {protocolFee}</li>
        <BurnableTokens network={network} />
      </ul>
    </div>
  )
}

export default Network
