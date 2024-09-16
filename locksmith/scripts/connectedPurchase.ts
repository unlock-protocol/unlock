import * as Base64 from '../src/utils/base64'

import { generateTypedSignature } from '../src/utils/signature'

function generatePurchasePayload(message: any, messageKey: string) {
  return {
    types: {
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
    messageKey,
  }
}

const recipient = '0xD8fDbF2302b13d4CF00BAC1a25EFb786759c7788'
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

const typedData = generatePurchasePayload(message, 'purchaseRequest')
async function postPurchaseRequest(
  privateKey: string,
  metadata: any,
  endpoint: string
) {
  const signature = await generateTypedSignature(privateKey, metadata)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Base64.encode(signature)}`,
    },
    body: JSON.stringify(metadata),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

postPurchaseRequest(pk, typedData, 'http://localhost:8080/purchase/USD')
