import type { HDNodeWallet } from 'ethers'
import { Wallet, encryptKeystoreJson } from 'ethers'
import { WALLET_ENCRYPTION_OPTIONS } from '../constants'

async function getJSONWallet(wallet: HDNodeWallet | Wallet) {
  const address = await wallet.getAddress()
  const { privateKey } = wallet

  const account = {
    address,
    privateKey,
  }

  let accountMnemonic
  if (
    'mnemonic' in wallet &&
    wallet.mnemonic &&
    wallet.mnemonic.wordlist.locale === 'en' &&
    wallet.mnemonic.password === '' &&
    wallet.path
  ) {
    accountMnemonic = {
      path: wallet.path,
      locale: 'en',
      entropy: wallet.mnemonic.entropy,
    }
  }

  return { ...account, mnemonic: accountMnemonic }
}

export async function createAccountAndPasswordEncryptKey(password: string) {
  const newWallet = Wallet.createRandom()
  // ethers v6 `wallet.encrypt` dont take options anymore so we convert our
  // wallet to JSON and scnrypt it
  const jsonWallet = await getJSONWallet(newWallet)
  const encrypted = await encryptKeystoreJson(
    jsonWallet,
    password,
    WALLET_ENCRYPTION_OPTIONS
  )
  const passwordEncryptedPrivateKey = JSON.parse(encrypted)
  const address = await newWallet.getAddress()
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
export async function getAccountFromPrivateKey(
  encryptedPrivateKey: string,
  password: string
) {
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
  encryptedPrivateKey: string,
  password: string,
  newPassword: string
) {
  const wallet = await getAccountFromPrivateKey(encryptedPrivateKey, password)
  const jsonWallet = await getJSONWallet(wallet)
  const encrypted = await encryptKeystoreJson(
    jsonWallet,
    newPassword,
    WALLET_ENCRYPTION_OPTIONS
  )
  return JSON.parse(encrypted)
}
