export async function blockHandler(storage, blockNumber, emitter, provider) {
  let blockDetails = await provider.getBlock(blockNumber)
  storage.storeBlock(blockDetails)

  blockDetails.transactions.forEach(transactionHash => {
    emitter.emit('transaction', transactionHash)
  })
}
