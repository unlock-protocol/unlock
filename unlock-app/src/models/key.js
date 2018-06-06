// TODO: prevent extensibility? This needs to be a strict schema
// TODO: strict type!

class Key {

  constructor(attrs) {
    this.expiration = attrs.expiration
    this.data = attrs.data
    Object.preventExtensions(this)
  }
}

export default Key