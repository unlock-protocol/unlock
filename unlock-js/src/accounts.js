const Wallet = require('ethers').Wallet

export async function createAccountAndPasswordEncryptKey(password) {
  const newWallet = Wallet.createRandom()
  const address = await newWallet.getAddress()
  const passwordEncryptedPrivateKey = JSON.parse(
    await newWallet.encrypt(password)
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
export async function getAccountFromPrivateKey(encryptedPrivateKey, password) {
  const wallet = await Wallet.fromEncryptedJson(
    JSON.stringify(encryptedPrivateKey),
    password
  )
  return wallet
}
