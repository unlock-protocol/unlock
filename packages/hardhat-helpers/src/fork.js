const { ethers } = require('ethers')

const ERC20_ABI = require('./ABIs/erc20.json')
const USDC_ABI = require('./ABIs/USDC.json')
const { abi: WETH_ABI } = require('./ABIs/weth.json')

const { MAX_UINT } = require('./constants')
const { getNetwork, getUnlock, getUdt } = require('./unlock')
const { getTokens } = require('./tokens')

const getChainId = () => {
  const chainId = parseInt(process.env.RUN_FORK)
  if (isNaN(chainId)) {
    throw Error(`chain id ('${process.env.RUN_FORK}') should be a number`)
  }
  return chainId
}

const getForkUrl = () => {
  return `https://rpc.unlock-protocol.com/${getChainId()}`
}

async function getWhales(chainId = 1) {
  const tokens = await getTokens()
  const { address: UDT } = await getUdt()
  switch (chainId) {
    case 1:
      return {
        [tokens.DAI]: '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8', // PulseX
        [tokens.USDC]: '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
        [tokens.WBTC]: '0x845cbCb8230197F733b59cFE1795F282786f212C',
        [tokens.UDT]: '0xf5c28ce24acf47849988f147d5c75787c0103534', // unlock-protocol.eth
      }

    case 137:
      return {
        [tokens.USDC]: '0xf977814e90da44bfa03b6295a0616a897441acec',
        [tokens.DAI]: '0x91993f2101cc758d0deb7279d41e880f7defe827',
        [tokens.WBTC]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        [tokens.UDT]: '0xf5c28ce24acf47849988f147d5c75787c0103534',
      }
    default:
      break
  }
}

// parse mainnet fork
const parseForkUrl = (networks) => {
  const chainId = getChainId()
  const url = getForkUrl()
  console.log(`Running a fork (chainId : ${chainId})...`)
  networks.hardhat = {
    chainId,
    forking: {
      url,
    },
  }

  // needed for Uniswap Router to compute routes on local forks
  networks.hardhat.blockGasLimit = 1_000_000_000

  // set the correct chainId to use with local node over RPC
  networks.localhost.chainId = chainId
  networks.localhost.url = 'http://localhost:8545'
}

const resetNodeState = async () => {
  const { ethers, network, config } = require('hardhat')
  // reset fork
  const { forking } = config.networks.hardhat
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: forking.url,
          blockNumber: forking.blockNumber,
        },
      },
    ],
  })
}

const addSomeETH = async (
  address,
  amount = ethers.utils.parseEther('1000')
) => {
  const { network } = require('hardhat')
  const balance = `0x${BigInt(amount.toString()).toString(16)}`
  await network.provider.send('hardhat_setBalance', [address, balance])
}

const impersonate = async (address) => {
  const { network, ethers } = require('hardhat')
  // provider workaround for hardhat bug
  // see https://github.com/NomicFoundation/hardhat/issues/1226#issuecomment-1181706467
  let provider
  if (network.config.url) {
    provider = new ethers.providers.JsonRpcProvider(network.config.url)
  } else {
    // if network.config.url is undefined, then this is the hardhat network
    provider = ethers.provider
  }

  await provider.send('hardhat_impersonateAccount', [address])
  await addSomeETH(address) // give some ETH just in case

  // return signer
  const signer = provider.getSigner(address)
  signer.address = signer._address
  return signer
}

const stopImpersonate = async (address) => {
  const { network } = require('hardhat')
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [address],
  })
}

const addERC20 = async function (
  tokenAddress,
  address,
  amount = ethers.parseEther('1000')
) {
  const { ethers } = require('hardhat')
  const {
    nativeCurrency: { wrapped },
  } = await getNetwork()

  // wrapped some ETH
  if (tokenAddress.toLowerCase() === wrapped.toLowerCase()) {
    await addSomeETH(address)
    const weth = await ethers.getContractAt(WETH_ABI, wrapped)
    const signer = await impersonate(address)
    const tx = await weth.connect(signer).deposit({ value: amount.toString() })
    return weth
  }

  // special for UDT
  const unlock = await getUnlock()
  const udt = await unlock.udt()
  if (tokenAddress.toLowerCase() === udt.toLowerCase()) {
    await addUDT(address, amount)
    return await ethers.getContractAt(ERC20_ABI, udt)
  }

  // otherwise use transfer from whales
  const whales = await getWhales()
  if (!whales[tokenAddress])
    throw Error(`No whale for this address: ${tokenAddress}`)
  const whale = await ethers.getSigner(whales[tokenAddress])
  await impersonate(whale.address)

  const erc20Contract = await ethers.getContractAt(ERC20_ABI, tokenAddress)
  await erc20Contract.connect(whale).transfer(address, amount)
  return erc20Contract
}

const toBytes32 = (bn) => {
  return ethers.hexlify(ethers.zeroPad(bn.toHexString(), 32))
}

const addUDT = async (recipientAddress, amount = 1000, udt) => {
  const { ethers, network } = require('hardhat')
  const { chainId } = await ethers.provider.getNetwork()
  if (!udt) {
    udt = await getUdt()
  }

  // UDT contract
  const udtAmount =
    typeof amount === 'bigint' ? amount : ethers.parseEther(`${amount}`)

  if (chainId === 1 || chainId === 5) {
    // NB: slot has been found by using slot20 - see https://kndrck.co/posts/local_erc20_bal_mani_w_hh/
    // Get storage slot index
    const index = ethers.solidityKeccak256(
      ['uint256', 'uint256'],
      [recipientAddress, 51] // key, slot
    )

    // Manipulate local balance (needs to be bytes32 string)
    await network.provider.request({
      method: 'hardhat_setStorageAt',
      params: [udt.address, index.toString(), toBytes32(udtAmount).toString()],
    })
    // Just mines to the next block
    await ethers.provider.send('evm_mine', [])
  } else {
    const unlock_protocol_eth = '0xf5c28ce24acf47849988f147d5c75787c0103534'
    const whale = await ethers.getSigner(unlock_protocol_eth)
    await impersonate(unlock_protocol_eth)

    await udt.connect(whale).transfer(recipientAddress, amount)
    return udt
  }
}

const delegates = [
  '0x0d8410643ae7a4d833c7219e5c6fadfa5ce912cd',
  '0x6aec5228fda60525f59afc773ada7df6a6d8e43f',
  '0xde22DE740609532FC0F48287b7F258776bE814FD',
]

// main UDT holders on mainnet
const getDelegates = async () => {
  return await Promise.all(delegates.map((delegate) => impersonate(delegate)))
}

const getERC20Contract = async (tokenAddress) => {
  const { ethers } = require('hardhat')
  const {
    nativeCurrency: { wrapped },
  } = await getNetwork()
  const [signer] = await ethers.getSigners()
  return tokenAddress === wrapped
    ? await ethers.getContractAt(WETH_ABI, wrapped, signer)
    : await ethers.getContractAt(ERC20_ABI, tokenAddress, signer)
}

const addSomeUSDC = async (usdcAddress, recipientAddress, amount = 1000) => {
  const { ethers } = require('hardhat')
  const usdc = await ethers.getContractAt(USDC_ABI, usdcAddress)
  const masterMinter = await usdc.masterMinter()
  await impersonate(masterMinter)
  const minter = await ethers.getSigner(masterMinter)
  await (
    await usdc.connect(minter).configureMinter(recipientAddress, MAX_UINT)
  ).wait()
  await (await usdc.mint(recipientAddress, amount)).wait()
}

module.exports = {
  resetNodeState,
  impersonate,
  stopImpersonate,
  getDelegates,
  getERC20Contract,
  addUDT,
  addSomeETH,
  addSomeUSDC,
  addERC20,
  delegates,
  parseForkUrl,
}
