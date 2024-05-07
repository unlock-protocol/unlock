const { ethers } = require('hardhat')

const { deployERC20, deployWETH } = require('./tokens')
const { addSomeETH } = require('@unlock-protocol/hardhat-helpers')

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
    await wethSrc.getAddress(),
    await wethDest.getAddress(),
    srcDomainId,
    // both token mentioned for the swap
    await erc20Src.getAddress(),
    await erc20Dest.getAddress()
  )

  // fund the bridge
  await addSomeETH(await bridge.getAddress())
  await erc20Dest.mint(await bridge.getAddress(), ethers.parseEther('100'))

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
