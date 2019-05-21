import ensureWalletReady from './ensureWalletReady'
import { getAccount } from './account'
import { getNetwork } from './network'

/**
 * @param {window} window the global window context, needed for both `fetch`
 * @param {string} locksmithHost the full URI for locksmith
 * @param {web3Service} web3Service the web3Service instance
 * @param {walletService} walletService the walletService instance, needed to ensure account and network are accurate
 */
export default async function locksmithTransactions(
  window,
  locksmithHost,
  web3Service,
  walletService
) {
  await ensureWalletReady(walletService)
  const account = getAccount()
  const network = getNetwork()

  const url = `${locksmithHost}/transactions?sender=${account}`

  const response = await window.fetch(url)
  const result = await response.json()
  if (result.data && result.data.transactions) {
    const newTransactions = result.data.transactions
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
        return web3Service.getTransaction(
          transaction.hash,
          transaction.input ? transaction : undefined
        )
      })
    const updatedTransactions = await Promise.all(newTransactions)
    return updatedTransactions.reduce(
      (collect, transaction) => ({
        ...collect,
        [transaction.hash]: transaction,
      }),
      {}
    )
  }
  return {}
}
