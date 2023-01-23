// see https://docs.connext.network/resources/deployments as referencce

const mumbai = {
  domainId : 9991,
  purchaserAddress: '0x84d085898F6ae4ae8c4225f2601F29a10335F653',
  connext : '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a',
  testERC20: '0xeDb95D8037f769B72AAab41deeC92903A98C9E16',
  testLock: '0xcB145795F79DeA52b6c8F2d29cA1e81E7e99A0f2',
  wethAddress : '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
}

const goerli = {
  domainId: 1735353714,
  purchaserAddress: '0x78ff4bbA01DAbfb235C395f8369f78770581F1f8',
  connext : '0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649',
  testLock: "0xde81091C88b56Cb7A1eCd077ac9750a5129C9953",
  testERC20: '0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1',
  wethAddress : '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
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