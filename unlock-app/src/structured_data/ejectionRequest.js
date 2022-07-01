// Example usage:
//
// let message = {
//   user: {
//     publicKey: '0xef49773e0d59f607cea8c8be4ce87bd26fd8e208',
//   },
// }
//
// let typedData = EjectionRequest.build(message)

export default class EjectionRequest {
  static build(message) {
    return {
      types: {
        User: [{ name: 'publicKey', type: 'address' }],
      },
      domain: {
        name: 'Unlock',
        version: '1',
      },
      primaryType: 'User',
      message,
      messageKey: 'user',
    }
  }
}
