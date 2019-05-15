import waitForReady from './waitForReady'
import pollForChanges from './pollForChanges'

let account
let accountBalance = 0

export function getAccount() {
  return account
}

export function setAccount(address) {
  account = address
}

export function getAccountBalance() {
  return accountBalance
}

export function setAccountBalance(balance) {
  accountBalance = balance
}

export async function pollForAccountChange(
  walletService,
  web3Service,
  onAccountChange = () => {}
) {
  await waitForReady()

  pollForChanges(
    async () => await walletService.getAccount() /* getFunc */,
    (before, after) => before !== after /* hasValueChanged */,
    async newAccount => {
      // only called when account has changed
      /* changeListener */
      setAccount(newAccount)
      setAccountBalance(
        newAccount ? await web3Service.getAddressBalance(newAccount) : 0
      )
      onAccountChange(account, accountBalance)
    }
  )
}
