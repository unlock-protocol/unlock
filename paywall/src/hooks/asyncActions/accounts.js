export const getAccounts = async (handle, wallet) => {
  let account
  try {
    const accounts = await wallet.eth.getAccounts()
    account = accounts[0] || null
  } catch (e) {
    account = null
  }
  handle(account)
}

export const getBalance = async (handle, wallet, account) => {
  if (!account) {
    handle('0')
    return
  }
  let balance
  try {
    balance = await wallet.eth.getBalance(account)
  } catch (e) {
    balance = '0'
  }
  handle(balance)
}

export const getWeb3ServiceBalance = async (handle, web3Service, account) => {
  if (!account) {
    handle('0')
    return
  }
  try {
    const balance = await web3Service.getAddressBalance(account)
    handle(balance)
  } catch (e) {
    handle('0')
  }
}
