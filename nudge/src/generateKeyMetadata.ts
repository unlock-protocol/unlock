import { KeyMetadata } from './models/keyMetadata'
import KeyData from './utils/keyData'
import { getMetadata } from './userMetadataOperations'

const config = require('../config/config')

export const generateKeyMetadata = async (address: string, keyId: string) => {
  const onChainKeyMetadata = await fetchChainData(address, keyId)

  if (Object.keys(onChainKeyMetadata).length == 0) {
    return {}
  } else {
    return handleValidKey(address, keyId, onChainKeyMetadata)
  }
}

export const fetchChainData = async (
  address: string,
  keyId: string
): Promise<any> => {
  const kd = new KeyData(config.web3ProviderHost)
  const data = await kd.get(address, keyId)
  return kd.openSeaPresentation(data)
}


export const handleValidKey = async (
  address: string,
  keyId: string,
  onChainKeyMetadata: any
): Promise<any> => {
  let [userMetadata, keyCentricData] = await Promise.all([
    getMetadata(address, await keyOwner(address, keyId)),
    getKeyCentricData(address, keyId),
  ])
  return Object.assign(keyCentricData, onChainKeyMetadata, userMetadata)
}



const keyOwner = async (address: string, keyId: string): Promise<string> => {
  const kd = new KeyData(config.web3ProviderHost)
  const data = await kd.get(address, keyId)
  return data.owner
}

const getKeyCentricData = async (
  address: string,
  tokenId: string
): Promise<any> => {
  const keyCentricData: any = await KeyMetadata.findOne({
    where: {
      address,
      id: tokenId,
    },
  })

  const result = keyCentricData ? keyCentricData.data : {}
  return result
}

