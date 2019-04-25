import createAccountAndPasswordEncryptKey from '../accounts'

describe('web3 accounts creation', () => {
  it('should call web3.accounts.create', () => {
    expect.assertions(2)

    const {
      address,
      passwordEncryptedPrivateKey,
    } = createAccountAndPasswordEncryptKey('hello')

    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(passwordEncryptedPrivateKey.address).toBe(
      address.substring(2).toLowerCase()
    )
  })
})
