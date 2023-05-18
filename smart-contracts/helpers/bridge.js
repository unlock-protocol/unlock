// see https://docs.connext.network/resources/deployments as referencce

const mumbai = {
  domainId : 9991,
  connext : '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a',
  testERC20: '0xeDb95D8037f769B72AAab41deeC92903A98C9E16',
  testLockERC20: '0xcB145795F79DeA52b6c8F2d29cA1e81E7e99A0f2',
  testLockNative: '0x501e0c8216d8f53ea92faf70b573bab9344f8038',
  wethAddress : '0xFD2AB41e083c75085807c4A65C0A14FDD93d55A9',
  bridgeAddress: '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a',
  unlockOwnerAddress: '0xdc230F9A08918FaA5ae48B8E13647789A8B6dD46'
}

const goerli = {
  domainId: 1735353714,
  connext : '0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649',
  testLock: "0xde81091C88b56Cb7A1eCd077ac9750a5129C9953",
  testERC20: '0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1',
  wethAddress : '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  bridgeAddress: '0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649',
  unlockOwnerAddress: '0x6E74DC46EbF2cDB75B72Ab1dCAe3C98c7E9d28a1'
}


// check nonce for polygon stuck txs :(
// https://gasstation-mainnet.matic.network/v2
// const FEE_DATA = {
//   maxFeePerGas:         ethers.utils.parseUnits('150', 'gwei'),
//   maxPriorityFeePerGas: ethers.utils.parseUnits('100',   'gwei'),
// } 

// if(chainId === 80001) {
//   const nonce = await ethers.provider.getTransactionCount(deployer.address)
//   const pending = await ethers.provider.getTransactionCount(deployer.address, 'pending')
//   if( nonce < pending ) {
//     // unstuck polygon with some random tx
//     const tx = await deployer.sendTransaction({
//       to: deployer.address,
//       nonce,
//       gasLimit: 58000,
//       gasPrice: ethers.utils.parseUnits('50', 'gwei')
//       // data: 
//     })
//     await tx.wait()
//   }
// }

module.exports = {
  5: goerli,
  80001: mumbai,
}