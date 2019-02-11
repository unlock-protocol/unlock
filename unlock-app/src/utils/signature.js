import TypedDataSignature from './typedDataSignature'
import UnlockLock from '../structured_data/unlockLock'

export default function generateSignature(web3, address, data) {
  let signer = new TypedDataSignature(web3)
  let dataUpdated = UnlockLock.build(data)

  return new Promise(async (resolve, reject) => {
    try {
      let result = await signer.generateSignature(address, dataUpdated)
      resolve({ result: base64Encode(result), data: dataUpdated })
    } catch (error) {
      reject(error)
    }
  })
}

function base64Encode(data) {
  return Buffer.from(data).toString('base64')
}
