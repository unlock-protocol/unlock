import TypedDataSignature from '../../utils/typedDataSignature'

let web3_metamask = { currentProvider: { isMetaMask: true } }
let web3_generic = { currentProvider: { isMetaMask: false } }

describe('generalSignTypedDataHandler', () => {
  describe('when the web3 provider is metamask', () => {
    it('utilizes the eth_signTypedData_v3 JSON RPC methods with the JSON stringified version of the data', () => {
      expect.assertions(1)
      let tds = new TypedDataSignature(web3_metamask)

      tds.generalSignTypedDataHandler = jest.fn(() => {
        return 'data'
      })

      tds.generateSignature('0xcAFFe', 'some data')
      expect(tds.generalSignTypedDataHandler).toHaveBeenCalledWith(
        'eth_signTypedData_v3',
        '0xcAFFe',
        '"some data"'
      )
    })
  })

  describe('when the web3 provide is not metamask', () => {
    it('utilizes the eth_signTypedData JSON RPC methods', () => {
      expect.assertions(1)
      let tds = new TypedDataSignature(web3_generic)
      tds.generalSignTypedDataHandler = jest.fn(() => {
        return 'data'
      })

      tds.generateSignature('0xcAFFe', 'some data')
      expect(tds.generalSignTypedDataHandler).toHaveBeenCalledWith(
        'eth_signTypedData',
        '0xcAFFe',
        'some data'
      )
    })
  })
})
