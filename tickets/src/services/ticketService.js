import axios from 'axios'

export default class TicketService {
  constructor(host) {
    this.host = host
  }

  /**
   * Saves a new event to locksmith
   * @param {*} lockAddress
   * @param {*} name
   * @param {*} description
   * @param {*} location
   * @param {*} date
   * @param {*} owner
   * @param {*} logo
   * @returns {Promise<*>}
   */
  async createEvent(
    lockAddress,
    name,
    description,
    location,
    date,
    owner,
    logo
  ) {
    const payload = {
      lockAddress,
      name,
      description,
      location,
      date,
      owner,
      logo,
    }
    try {
      return await axios.post(`${this.host}/events/`, payload)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Retrieves new event details from locksmith by its lock address
   * @param {*} lockAddress
   * @returns {Promise<*>}
   */
  async getEvent(lockAddress) {
    try {
      return await axios.get(`${this.host}/events/${lockAddress}`)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
