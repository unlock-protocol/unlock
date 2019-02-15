export default class TypedDataSignature {
  constructor(web3) {
    this.web3 = web3
  }

  web3HTTPProviderSignTypedDataHandler(method, signee, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.web3.currentProvider.send(method, [
          signee,
          data,
        ])
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  generalSignTypedDataHandler(method, signee, data) {
    return new Promise(async (resolve, reject) => {
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

  generateSignature(signee, data) {
    if (this.web3.currentProvider.isMetaMask) {
      return this.generalSignTypedDataHandler(
        'eth_signTypedData_v3',
        signee,
        JSON.stringify(data)
      )
    } else {
      return this.web3HTTPProviderSignTypedDataHandler(
        'eth_signTypedData',
        signee,
        data
      )
    }
  }
}
