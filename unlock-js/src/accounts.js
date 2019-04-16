const Web3 = require('web3')

export function createAccountAndPasswordEncryptKey(password) {
  const web3 = new Web3()
  const { address, privateKey } = web3.eth.accounts.create()

  const passwordEncryptedPrivateKey = web3.eth.accounts.encrypt(
    privateKey,
    password
  )
  return {
    address,
    passwordEncryptedPrivateKey,
  }
}
