interface EjectionRequestProps {
  user: {
    publicKey: string
  }
}
export default class EjectionRequest {
  static build(message: EjectionRequestProps) {
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
