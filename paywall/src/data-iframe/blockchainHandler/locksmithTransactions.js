import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'
import { getNetwork } from './network'

export async function storeTransaction({
  window,
  transaction,
  locksmithHost,
  walletService,
}) {
  await ensureWalletReady(walletService)
  const account = getAccount()
  const network = getNetwork()

  const url = `${locksmithHost}/transaction`

  const payload = {
    transactionHash: transaction.hash,
    sender: account.toLowerCase(),
    recipient: transaction.to.toLowerCase(),
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
    // eslint-disable-next-line no-console
    console.log('unable to save key purchase transaction')
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

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

  const url = `${locksmithHost}/transaction`

  const payload = {
    transactionHash: transaction.hash,
    sender: account.toLowerCase(),
    recipient: transaction.to.toLowerCase(),
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

  const url = `${locksmithHost}/transactions?sender=${account.toLowerCase()}`

  const response = await window.fetch(url)
  const result = await response.json()
  if (result.transactions) {
    await Promise.all(
      result.transactions
        .map(t => ({
          hash: t.transactionHash,
          network: t.chain,
          to: t.recipient,
          input: t.data,
          from: t.sender,
        }))
        .filter(transaction => transaction.network === network)
        .map(transaction => {
          // we pass the transaction as defaults if it has input set, so that we can
          // parse out the transaction type and other details. If input is not set,
          // we can't safely pass the transaction default
          web3Service.getTransaction(
            transaction.hash,
            transaction.input ? transaction : undefined
          )
        })
    )
  }
}
