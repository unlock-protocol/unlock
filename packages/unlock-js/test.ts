import { ethers } from 'ethers'

let domain = {
  name: 'KeyManager',
  version: '1',
  chainId: 5,
  verifyingContract: '0x862A839FcDbA499bBFd6325bA1845787B4B44e61',
}
const types = {
  Transfer: [
    { name: 'lock', type: 'address' },
    { name: 'token', type: 'uint256' },
    { name: 'owner', type: 'address' },
    { name: 'deadline', type: 'uint256' },
  ],
}
const transfer = {
  deadline: 1674292360,
  owner: '0x231944D46f24559604ca1687Dc63ee9AaB49732F',
  lock: '0x2E5c7eCbcF8B53a2bEd83181178a627D4A4724f8',
  token: '1',
}

const signature =
  '0xb0110e61b156c33f42f67ea0f42bf3ffce865c155befab104f996b9f27c6f4916025ac87db70c8c93c7ce1f221906a30d955ea5b1b96b343b5c1ca91a555c5ca1b'
console.log(ethers.utils.verifyTypedData(domain, types, transfer, signature))
