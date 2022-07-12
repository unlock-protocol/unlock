const { ethers } = require('hardhat')
const fs = require('fs-extra')
const { Encoder, ErrorCorrectionLevel } = require('@nuintun/qrcode')

const IMG_PATH = './qr'
const NUMBER_OF_KEYS = 2
const lockAddress = '0x4D35Fb10150E3D5E09ce332bBc4366D9F89B49c5'
const verifURL = 'https://staging-app.unlock-protocol.com/verification'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()

  const PublicLock = await ethers.getContractFactory('PublicLock')
  const lock = PublicLock.attach(lockAddress)
  console.log(`Lock: ${await lock.name()} on network ${chainId}`)

  const keyPrice = await lock.keyPrice()
  const signers = await ethers.getSigners()
  const keyOwners = signers.slice(0, NUMBER_OF_KEYS)

  console.log(`buying ${keyOwners.length} keys...`)

  // buy the keys
  const tx = await lock.purchase(
    [],
    keyOwners.map(({ address }) => address),
    keyOwners.map(() => ethers.constants.AddressZero),
    keyOwners.map(() => ethers.constants.AddressZero),
    keyOwners.map(() => []),
    {
      value: keyPrice.mul(keyOwners.length),
    }
  )

  console.log('purchase tx:', tx.hash)

  // get token ids
  const { events } = await tx.wait()
  const args = events
    .filter((v) => v.event === 'Transfer')
    .map(({ args }) => args)

  // make sure folder exists
  await fs.ensureDir(IMG_PATH)

  for (let i = 0; i < args.length; i++) {
    const { tokenId, to } = args[i]
    const payload = JSON.stringify({
      network: Number(chainId),
      account: to,
      lockAddress: ethers.utils.getAddress(lockAddress),
      tokenId: `${tokenId}`.toLowerCase(),
      timestamp: Date.now(),
    })

    console.log(payload)

    // make sure we get the correct signer
    const signature = await signers[0].signMessage(payload)

    const url = new URL(`${verifURL}/verification`)
    url.searchParams.append('data', payload)
    url.searchParams.append('sig', JSON.stringify(signature))

    // generate qr code
    const qrcode = new Encoder()
    qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.L)
    qrcode.write(url.toString())
    qrcode.make()

    // this will return a base64 image
    // console.log(qrcode.toDataURL(5)) //.replace('data:image/gif;base64,', '')

    const img = Buffer.from(
      qrcode.toDataURL(5).replace('data:image/gif;base64,', ''),
      'base64'
    )

    // save as file
    await fs.writeFile(`${IMG_PATH}/${lockAddress}-${to}-${tokenId}.gif`, img)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
