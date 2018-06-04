// TODO: prevent extensibility? This needs to be a strict schema
// TODO: strict type!

class Account {

  constructor(attrs) {
    this.address = attrs.address
    this.privateKey = attrs.privateKey
    this.balance = attrs.balance
    Object.preventExtensions(this)
  }
}

export default Account