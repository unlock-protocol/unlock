/* eslint-disable global-require */
const { ethers, run, upgrades, network } = require('hardhat')
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const { networks } = require('@unlock-protocol/networks')
const createLock = require('../lock/create')
const { getUnlock, ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

const { MaxUint256 } = ethers

const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('UNLOCK DEPLOYMENT >', ...message)
}

// TODO: for each contract deployed, can we instantly verify them?
// TODO: prompt user for each action before doing them and ask them for input?
async function main({
  premintAmount, // in ETH, must be a string
  liquidity, // in ETH, must be a string
  unlockAddress,
  unlockVersion,
  publicLockVersion,
  udtAddress,
  publicLockAddress,
  wethAddress,
  uniswapRouterAddress,
  uniswapFactoryAddress,
  oracleAddress,
  estimatedGasForPurchase,
  locksmithURI,
  owner,
}) {
  let udt
  const [deployer, minter] = await ethers.getSigners()

  // fetch chain info
  const { chainId } = await ethers.provider.getNetwork()
  const networkName = networks[chainId].name
  const isLocalNet = networkName === 'localhost'
  log(
    `Deploying contracts on ${networkName} with the account: ${deployer.address}`
  )

  log(`isLocalNet : ${isLocalNet}`)
  if (!unlockAddress) {
    // deploying Unlock with a transparent / upgradable proxy
    unlockAddress = await run('deploy:unlock', { unlockVersion })
  }

  // deploying PublicLock
  if (!publicLockAddress) {
    publicLockAddress = await run('deploy:template', { publicLockVersion })
  }

  // set lock template
  await run('set:template', {
    publicLockAddress,
    unlockAddress,
    unlockVersion,
  })

  // deploy UDT
  if (!udtAddress && isLocalNet) {
    // shutdown UDT on local for now
    // udtAddress = await run('deploy:udt')
  }

  if (!udtAddress) {
    udtAddress = ADDRESS_ZERO
  }

  // If UDT is not set for this network, let's not worry about it
  if (udtAddress !== ADDRESS_ZERO) {
    // pre-mint some UDTs, then delegate mint caps to contract
    if (isLocalNet || premintAmount) {
      const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
      udt = UDT.attach(udtAddress)

      udt = udt.connect(minter)
      await udt.mint(
        deployer.address,
        ethers.parseEther(premintAmount || '1000000.0')
      )
      log(`Pre-minted ${premintAmount || '1000000.0'} UDT to deployer`)

      await udt.addMinter(unlockAddress)
      log('grant minting permissions to the Unlock Contract')

      await udt.renounceMinter()
      log('minter renounced minter role')
    }

    // deploy WETH
    if (!wethAddress && isLocalNet) {
      wethAddress = await run('deploy:weth')
      log(`WETH deployed to : ${wethAddress}`)
    }

    // deploy uniswap v2 if needed
    if ((!uniswapFactoryAddress || !uniswapRouterAddress) && isLocalNet) {
      if (!wethAddress || wethAddress === ADDRESS_ZERO) {
        throw new Error(
          'Missing wethAddress. Cannot deploy Uniswap factory. Please use --weth-address'
        )
      }
      const { router, factory } = await run('deploy:uniswap', { wethAddress })
      uniswapRouterAddress = router
      uniswapFactoryAddress = factory
    }

    if (!uniswapRouterAddress) {
      throw new Error(
        'Missing uniswapRouterAddress. Cannot proceed. Please use --uniswap-router-address'
      )
    }

    if (!uniswapFactoryAddress) {
      throw new Error(
        'Missing uniswapFactoryAddress. Cannot proceed. Please use --uniswap-factory-address'
      )
    }

    // get uniswap instance
    const Router = await ethers.getContractFactory(
      UniswapV2Router02.abi,
      UniswapV2Router02.bytecode
    )
    const uniswapRouter = Router.attach(uniswapRouterAddress)
    uniswapFactoryAddress = await uniswapRouter.factory()

    // add liquidity
    if (isLocalNet) {
      const amountLiquidity = liquidity || '1000.0'
      await udt
        .connect(deployer)
        .approve(uniswapRouterAddress, ethers.parseEther(amountLiquidity))
      log(`UDT approved Uniswap Router for ${amountLiquidity} ETH`)

      await uniswapRouter.connect(deployer).addLiquidityETH(
        udtAddress,
        ethers.parseEther(amountLiquidity), // pool size
        '1',
        '1',
        deployer.address, // receiver
        MaxUint256, // max timestamp
        { value: ethers.parseEther('10.0') }
      )
      log(`added liquidity to uniswap ${amountLiquidity}`)
    }

    // deploy oracle if needed
    if (!oracleAddress) {
      oracleAddress = await run('deploy:oracle', {
        uniswapFactoryAddress,
      })
    }
  }

  // config unlock
  await run('set:unlock-config', {
    unlockAddress,
    udtAddress,
    wethAddress: wethAddress || ADDRESS_ZERO,
    estimatedGasForPurchase,
    locksmithURI,
    isLocalNet,
  })

  if (udtAddress !== ADDRESS_ZERO && oracleAddress) {
    // Add Oracle for UDT (note: Oracle is also used to compute GDP of non-native-currency locks)
    await run('set:unlock-oracle', {
      unlockAddress,
      udtAddress,
      oracleAddress,
    })
  }

  // Transfer ownership of Unlock + Proxy admin
  const multisig = networks[chainId.toString()].multisig
  if (!owner && multisig) {
    owner = multisig
    if (owner) {
      const unlock = await getUnlock(unlockAddress)
      await unlock.transferOwnership(owner)
      console.log(`> Transfered ownership of KeyManager to owner ${owner}`)

      // Transfer ownership of proxyadmin!
      const proxyAdmin = await upgrades.admin.getInstance()
      const proxyAdminOwner = await proxyAdmin.owner()
      if (proxyAdminOwner === deployer.address) {
        console.log(
          `> Proxy admin is owned by deployer, transfering to owner ${owner}`
        )
        await upgrades.admin.transferProxyAdminOwnership(owner)
        console.log(`> Transfered proxy admin ownership to ${owner}`)
      } else if (proxyAdminOwner === owner) {
        console.log(`> Proxy admin is already owned by ${owner}`)
      } else {
        console.log(
          `⚠️ Proxy admin is owned by ${proxyAdminOwner}! Can't transfer to ${owner}!`
        )
      }
    }
  }

  // Test by deploying a lock
  await createLock({
    unlockAddress,
    price: 0,
    duration: 60 * 60 * 24 * 30,
    maxNumberOfKeys: 100,
    name: 'Test Lock',
  })
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
