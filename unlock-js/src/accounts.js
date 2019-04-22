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

/**
 * Given an encrypted private key and a password, decrypts the private key and
 * gets the public address from it.
 * @param {*} encryptedPrivateKey
 * @param {string} password
 * @throws Throws an error if password does not decrypt private key.
 */
export function getAddressFromPrivateKey(encryptedPrivateKey, password) {
  const web3 = new Web3()

  const { address } = web3.eth.accounts.decrypt(encryptedPrivateKey, password)

  return address
}
