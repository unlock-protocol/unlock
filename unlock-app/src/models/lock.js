// TODO: prevent extensibility? This needs to be a strict schema
// TODO: strict type!

class Lock {

  constructor(attrs = {}) {
    this.address = attrs.address
    this.keyPrice = attrs.keyPrice
    this.expirationDuration = attrs.expirationDuration
    this.keyReleaseMechanism = attrs.keyReleaseMechanism
    this.outstandingKeys = attrs.outstandingKeys
    this.maxNumberOfKeys = attrs.maxNumberOfKeys
    this.keyPriceCalculator = attrs.keyPriceCalculator
    this.owner = attrs.owner
    this.expirationTimestamp = attrs.expirationTimestamp
    this.balance = 0
    Object.preventExtensions(this)
  }
}

export default Lock