import { keysByQuery } from './src/graphql/datasource'

import { sendEmail } from './src/operations/wedlocksOperations'
import * as keysOperations from './src/operations/keysOperations'
import { resourceLimits } from 'worker_threads'
import { UserTokenMetadata } from './src/models'
import * as Normalizer from './src/utils/normalizer'
import { generateQrCode } from './src/utils/qrcode'

const run = async () => {
  const network = 100
  const lockAddresses = [
    '0x2217D4fF7B9978ba123019Bf1F4DC0A2Bd46F9D6',
    '0x2F3c9b71f256E7450c47872aE00389C616B08646',
    '0x0AFAcfE618A9F24d54D0115F49cf8045f1BDf192',
    '0x130014EC766B83B78a86f53ea8Ec772484f60Eed',
    '0xEBDA633e76C2cb1983E223D2f186ae45575913D3',
  ]

  const graphQLClient = new keysByQuery(network)

  const result = await graphQLClient.get({
    addresses: lockAddresses,
    filters: '',
  })

  const processNext = async (list) => {
    let next = list.pop()
    if (!next) {
      return
    }

    const userTokenMetadataRecord = await UserTokenMetadata.findOne({
      where: {
        tokenAddress: Normalizer.ethereumAddress(next.lock),
        userAddress: Normalizer.ethereumAddress(next.owner.address),
      },
    })

    const protectedData = Normalizer.toLowerCaseKeys({
      ...userTokenMetadataRecord?.data?.userMetadata?.protected,
    })

    const recipient = protectedData?.email

    const attachments = []
    const qrCode = await generateQrCode({
      network,
      lockAddress: next.lock,
      tokenId: next.keyId,
    })
    attachments.push({ path: qrCode })

    await sendEmail(
      `dappcon`,
      '',
      'julien@unlock-protocol.com',
      {},
      attachments
    )

    return processNext(list)
  }

  const keys = result
    .map((result) => {
      return result.keys.map((key) => {
        return {
          ...key,
          lock: result.address,
        }
      })
    })
    .flat()

  await processNext(keys)
}

async function main() {
  run()
}

main()
