import { Registry } from '../registry'

function getTransactionData(provider, transactionHash) {
  return provider.getTransaction(transactionHash)
}

/** this needs to be adjusted */
async function filterTransaction(transaction, connection) {
  let registry = await Registry.get(connection)

  return (
    registry.includes(transaction.to) || registry.includes(transaction.from)
  )
}

async function transactionHandler(
  storage,
  connection,
  transactionHash,
  provider
) {
  try {
    let transaction = await exportFunctions.getTransactionData(
      provider,
      transactionHash
    )

    if (await filterTransaction(transaction, connection)) {
      storage.storeTransaction(transaction)
    }
  } catch (e) {}
}

const exportFunctions = {
  getTransactionData,
  filterTransaction,
  transactionHandler,
}

export default exportFunctions
