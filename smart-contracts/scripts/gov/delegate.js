const { ethers } = require('hardhat')
const { impersonate } = require('../../test/helpers/mainnet')

async function main({ holderAddress, delegateAddress, UDTAddress }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  // eslint-disable-next-line no-console
  if (isDev) console.log('Dev mode ON')

  if (!delegateAddress) {
    // eslint-disable-next-line no-console
    throw new Error('UDT DELEGATE > Missing delegate address.')
  }

  let holder
  if (holderAddress) {
    await ethers.getSigner(holderAddress)
    if (isDev) {
      await impersonate(holderAddress)
    }
  } else {
    ;[holder] = await ethers.getSigners()
  }

  const udt = await new ethers.Contract('UnlockDiscountTokenV3', UDTAddress)
  const tx = await udt.delegate(delegateAddress)

  const { events, transactionHash } = await tx.wait()
  const evt = events.find((v) => v.event === 'DelegateChanged')

  // check for failure
  if (!evt) {
    throw new Error('UDT DELEGATE > Delegation failed.')
  }

  // success
  const { proposalId } = evt.args
  // eslint-disable-next-line no-console
  console.log(
    `UDT DELEGATE > Delegation from ${holder.address} to ${delegateAddress} successful. (txid: ${transactionHash})`
  )

  return proposalId
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
