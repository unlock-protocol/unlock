module.exports = async function revertTime () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_revert",
      params: [1],
      id: new Date().getSeconds()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    })
  })
}