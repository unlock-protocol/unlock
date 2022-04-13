import { WALLET_ENCRYPTION_OPTIONS } from '../constants'

const Wallet = require('ethers').Wallet

export async function createAccountAndPasswordEncryptKey(password) {
  const newWallet = Wallet.createRandom()
  const address = await newWallet.getAddress()
  const passwordEncryptedPrivateKey = JSON.parse(
    await newWallet.encrypt(password, WALLET_ENCRYPTION_OPTIONS)
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

/**
 * Given an encrypted private key, the password, and a new password,
 * decrypts the private key and re-encrypts it with the new password.
 * @param {*} encryptedPrivateKey
 * @param {string} password
 * @param {string} newPassword
 * @throws Throws an error if the password does not decrypt private key.
 */
export async function reEncryptPrivateKey(
  encryptedPrivateKey,
  password,
  newPassword
) {
  const wallet = await getAccountFromPrivateKey(encryptedPrivateKey, password)
  const newWallet = await wallet.encrypt(newPassword, WALLET_ENCRYPTION_OPTIONS)
  return JSON.parse(newWallet)
}
