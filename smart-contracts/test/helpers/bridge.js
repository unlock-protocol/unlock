const { ethers } = require('hardhat')

const { deployERC20, deployWETH } = require('./tokens')
const { addSomeETH } = require('./fork')

// default to mainnet
const SRC_DOMAIN_ID = 6648936

async function deployBridge(srcDomainId = SRC_DOMAIN_ID) {
  const [unlockOwner] = await ethers.getSigners()

  // deploy weth & a token
  const wethSrc = await deployWETH(unlockOwner)
  const wethDest = await deployWETH(unlockOwner)

  // ERC20s on each chain
  const erc20Src = await deployERC20(unlockOwner, true)
  const erc20Dest = await deployERC20(unlockOwner, true)

  // connext
  const MockConnext = await ethers.getContractFactory('TestBridge')
  const bridge = await MockConnext.deploy(
    wethSrc.address,
    wethDest.address,
    srcDomainId,
    // both token mentioned for the swap
    erc20Src.address,
    erc20Dest.address
  )

  // fund the bridge
  await addSomeETH(bridge.address)
  await erc20Dest.mint(bridge.address, ethers.utils.parseEther('100'))

  return {
    bridge: bridge,
    wethSrc,
    wethDest,
    erc20Src,
    erc20Dest,
  }
}

module.exports = {
  deployBridge,
}
