const { Web3Service } = require('@unlock-protocol/unlock-js')
const { networks } = require('@unlock-protocol/networks')
const web3Service = new Web3Service(networks)

async function main() {
  const provider = await web3Service.providerForNetwork(5)
  const lockContract = await web3Service.getLockContract(
    '0xBD6190D7bcA1875794E3e8537d0775B8782371EF',
    provider
  )

  const receipt = await provider.waitForTransaction(
    '0xbc750b1ff4267bba68028085f505026de8d152d7762dd9a513ded30b02b48013'
  )
  const parser = lockContract.interface

  const keyIds = receipt.logs
    .map((log) => {
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })
    ?.map((item) => {
      return {
        keyId: item.args.tokenId.toNumber(),
        to: item.args.to,
      }
    })
  console.log(keyIds)
}

main()
