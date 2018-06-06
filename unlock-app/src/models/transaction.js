// TODO: prevent extensibility? This needs to be a strict schema
// TODO: strict type!

class Transaction {

  constructor(attrs) {
    this.status = attrs.status
    this.confirmations = attrs.confirmations
    this.createdAt = new Date().getTime()
    this.hash = null
    this.transaction = null
    this.lock = null
    Object.preventExtensions(this)
  }
}

export default Transaction