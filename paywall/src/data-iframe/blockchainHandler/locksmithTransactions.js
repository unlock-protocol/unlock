import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'
import { getNetwork } from './network'
import { getRelevantLocks } from '../paywallConfig'

/**
 * sync a new transaction to locksmith
 *
 * @param {window} window the current global context (window, self, global)
 * @param {object} transaction the transaction to sync
 * @param {string} locksmithHost the base endpoint for locksmith
 * @param {walletService} walletService this is used to ensure we have an account/network
 */
export async function storeTransaction({
  window,
  transaction,
  locksmithHost,
  walletService,
}) {
  await ensureWalletReady(walletService)
  const account = getAccount()
  const network = getNetwork()
  // we use the transaction lock as the recipient
  const recipient = transaction.lock

  const url = `${locksmithHost}/transaction`

  const payload = {
    transactionHash: transaction.hash,
    sender: account,
    // when purchasing directly, who we purchase the key "for" is
    // also the "sender" whose wallet the funds came from
    for: account,
    recipient,
    data: transaction.input,
    chain: network,
  }
  try {
    await window.fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    // we don't pass this error along because it is a non-essential feature
    // eslint-disable-next-line no-console
    console.log('unable to save key purchase transaction')
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

/**
 * @param {window} window the global window context, needed for both `fetch`
 * @param {string} locksmithHost the full URI for locksmith
 * @param {web3Service} web3Service the web3Service instance
 * @param {walletService} walletService the walletService instance, needed to ensure account and network are accurate
 */
export default async function locksmithTransactions({
  window,
  locksmithHost,
  web3Service,
  walletService,
}) {
  await ensureWalletReady(walletService)
  const account = getAccount()
  const network = getNetwork()
  const lockAddresses = getRelevantLocks()

  // filter the transactions we request to only include the
  // transactions relevant to locks. In most cases this will be
  // key purchases
  const filterLocks = lockAddresses
    .map(lockAddress => `recipient[]=${encodeURIComponent(lockAddress)}`)
    .join('&')

  const url = `${locksmithHost}/transactions?for=${account.toLowerCase()}${
    filterLocks ? `&${filterLocks}` : ''
  }`

  const response = await window.fetch(url)
  const result = await response.json()
  if (result.transactions) {
    const transactions = Object.values(result.transactions)
    // take advantage of the order locksmith returns transactions
    // the last one is the newest
    for (let i = transactions.length - 1; i >= 0; i--) {
      const t = transactions[i]
      const transaction = {
        hash: t.transactionHash,
        network, // locksmith always uses the right network now
        to: t.recipient,
        input: t.data,
        from: t.sender,
        for: t.for,
      }
      const defaults = t.data ? transaction : undefined
      web3Service.getTransaction(transaction.hash, defaults).catch(error => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
