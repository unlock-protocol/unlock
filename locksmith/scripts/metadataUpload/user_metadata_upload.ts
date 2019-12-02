import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'
import * as Base64 from '../../src/utils/base64'

const args = require('yargs').argv
let request = require('request-promise-native')
var fs = require('fs')
const resolve = require('path').resolve

function generateSignature(privateKey: string, data: any) {
  let pk = ethJsUtil.toBuffer(privateKey)

  return sigUtil.signTypedData(pk, {
    data,
  })
}

async function updateMetadata(
  privateKey: string,
  metadata: any,
  endpoint: string
) {
  let signature = generateSignature(privateKey, metadata)
  let options = {
    uri: endpoint,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${Base64.encode(signature)}`,
    },
    json: metadata,
  }

  await request(options)
}

function generateUserMetadataPayload(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      UserMetaData: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'UserMetaData',
    message: message,
  }
}

function preflightCheck(
  privateKey: string,
  lockAddress: string,
  inputFile: string,
  host: string
) {
  return privateKey && lockAddress && inputFile && host
}

async function main(
  privateKey: string,
  lockAddress: string,
  inputFile: string,
  host: string
) {
  const userAddress = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
  const endpoint = `${host}/api/key/${lockAddress}/user/${userAddress}`
  var contents = fs.readFileSync(resolve(inputFile), 'utf8')
  let message = JSON.parse(contents)

  let data = generateUserMetadataPayload(message)
  updateMetadata(privateKey, data, endpoint)
}

//0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229
//'/Users/akeem/projects/unlock/locksmith/scripts/data.json'
//'http://localhost:8080'

let privateKey = args.privateKey
let lockAddress = args.lockAddress
let host = args.host
let inputFile = args.inputFile

if (preflightCheck(privateKey, lockAddress, inputFile, host)) {
  main(privateKey, lockAddress, inputFile, host)
} else {
  /* eslint-disable no-console */
  console.log('Currently missing required data, please review input')
}
