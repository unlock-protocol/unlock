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
  pollForChanges(
    () => walletService.getAccount() /* getFunc */,
    (before, after) => before !== after /* hasValueChanged */,
    () => 1 /* continuePolling */,
    async newAccount => {
      // only called when account has changed
      /* changeListener */
      const account = newAccount ? newAccount : null
      // this MUST be befre the async call to get the address balance
      // or ensureWalletReady calls will fail
      setAccount(account)
      const balance = newAccount
        ? await web3Service.getAddressBalance(newAccount)
        : '0'
      setAccountBalance(balance)
      onAccountChange(account, balance)
    } /*changeListener */,
    POLLING_INTERVAL /* delay */
  )
}
