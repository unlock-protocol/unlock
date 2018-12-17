import axios from 'axios'
import configure from '../config'

const { services } = configure(global)

export default class StorageService {
  HOST = services.storage.host

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
