import axios from 'axios'

export default class StorageService {
  HOST = 'http://localhost:4000'

  lockLookUp(address) {
    return axios.get(`${this.HOST}/lock/${address}`)
  }

  storeLockDetails(lock) {
    return axios.post(`${this.HOST}/lock`, lock)
  }

  updateLockDetails(update) {
    return axios.put(`${this.HOST}/lock`, update)
  }
}
