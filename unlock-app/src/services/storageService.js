import axios from 'axios'

export default class StorageService {
  constructor(host) {
    this.HOST = host
  }

  genAuthorizationHeader = token => {
    return { Authorization: ` Bearer ${token}` }
  }

  lockLookUp(address) {
    return axios.get(`${this.HOST}/lock/${address}`)
  }

  storeLockDetails(lock, token) {
    if (token) {
      return axios.post(`${this.HOST}/lock`, lock, {
        headers: this.genAuthorizationHeader(token),
      })
    } else {
      return axios.post(`${this.HOST}/lock`, lock)
    }
  }

  updateLockDetails(address, update, token) {
    if (token) {
      return axios.put(`${this.HOST}/lock/${address}`, update, {
        headers: this.genAuthorizationHeader(token),
      })
    } else {
      return axios.put(`${this.HOST}/lock/${address}`, update)
    }
  }
}
