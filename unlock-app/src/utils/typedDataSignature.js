export default class TypedDataSignature {
  constructor(web3) {
    this.web3 = web3
  }

  generalSignTypedDataHandler(method, signee, data) {
    return new Promise((resolve, reject) => {
      this.web3.currentProvider.send(
        {
          method: method,
          params: [signee, data],
          from: signee,
        },

        (err, result) => {
          if (err) {
            reject(err)
          }
          resolve(result.result)
        }
      )
    })
  }

  generateSignature(signer, data) {
    let method

    if (this.web3.currentProvider.isMetaMask) {
      method = 'eth_signTypedData_v3'
      data = JSON.stringify(data)
    } else {
      method = 'eth_signTypedData'
    }

    return this.generalSignTypedDataHandler(method, signer, data)
  }
}
