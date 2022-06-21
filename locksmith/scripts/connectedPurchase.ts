import * as Base64 from '../src/utils/base64'
import { generateTypedSignature } from '../src/utils/signature'

// const args = require('yargs').argv
const request = require('request-promise-native')

function generatePurchasePayload(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],

      PurchaseRequest: [
        { name: 'recipient', type: 'address' },
        { name: 'lock', type: 'address' },
        { name: 'expiry', type: 'uint64' },
        { name: 'USDAmount', type: 'uint64' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'PurchaseRequest',
    message: message,
  }
}

const recipient = '0xd8fdbf2302b13d4cf00bac1a25efb786759c7788'
const pk = '0x00a7bd3ec661f15214f8a48dce017e27dd8e1b4b779aaf823d8eb74d8c960b95'
const lock = '0xEE9FE39966DF737eECa5920ABa975c283784Faf8'

const message = {
  purchaseRequest: {
    recipient,
    lock,
    expiry: 17733658026,
    USDAmount: 2248,
  },
}

const typedData = generatePurchasePayload(message)
async function postPurchaseRequest(
  privateKey: string,
  metadata: any,
  endpoint: string
) {
  const signature = await generateTypedSignature(privateKey, metadata)
  const params = {
    uri: endpoint,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Base64.encode(signature)}`,
    },
    json: metadata,
  }

  await request(params)
}

postPurchaseRequest(pk, typedData, 'http://localhost:8080/purchase/USD')
