export default class Callbacker {
  private nextIDs: { [namespace: string]: number }
  private callbacks: { [id: string]: (payload: any) => void }

  constructor() {
    this.nextIDs = {}
    this.callbacks = {}
  }

  generateId = (namespace: string): string => {
    if (!this.nextIDs[namespace]) {
      this.nextIDs[namespace] = 0
    }

    const id = namespace + this.nextIDs[namespace]
    this.nextIDs[namespace]++
    return id
  }

  addCallback = (namespace: string, cb: (payload: any) => void): string => {
    const id = this.generateId(namespace)
    this.callbacks[id] = cb
    return id
  }

  call = (id: string, payload: any): boolean => {
    if (this.callbacks[id]) {
      this.callbacks[id](payload)
      // each callback will be called at most once.
      delete this.callbacks[id]
      return true
    }
    return false
  }
}
