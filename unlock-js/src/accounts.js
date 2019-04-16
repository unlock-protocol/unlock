export function createAccountAndPasswordEncryptKey(password) {
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
