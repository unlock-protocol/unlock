import ensureWalletReady from './ensureWalletReady'
import pollForChanges from './pollForChanges'
import { POLLING_INTERVAL } from '../../constants'

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
  await ensureWalletReady(walletService)

  pollForChanges(
    async () => await walletService.getAccount() /* getFunc */,
    (before, after) => before !== after /* hasValueChanged */,
    () => 1 /* continuePolling */,
    async newAccount => {
      // only called when account has changed
      /* changeListener */
      const account = newAccount ? newAccount : null
      const balance = newAccount
        ? await web3Service.getAddressBalance(newAccount)
        : '0'
      setAccount(account)
      setAccountBalance(balance)
      onAccountChange(account, balance)
    } /*changeListener */,
    POLLING_INTERVAL /* delay */
  )
}
