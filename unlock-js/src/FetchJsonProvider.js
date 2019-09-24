import { providers } from 'ethers'

export default class FetchJsonProvider extends providers.JsonRpcProvider {
  constructor(endpoint, rateLimit = 1000, maxRetries = 30) {
    super(endpoint)
    this.rateLimit = rateLimit
    this.maxRetries = maxRetries
    /**
     * https://docs.alchemyapi.io/docs/rate-limits#section-what-is-a-rate-limit
     * When you see a 429 response, retry the request with a small delay. We suggest waiting a random interval between 1000 and 1250 milliseconds and sending the request again, up to some maximum number of attempts you are willing to wait.
     */
  }

  /**
   * This wraps ether's JsonRpcProvider, with 2 pruposes:
   * - handling retries
   * - eventually support ServiceWorkers by using another Fetch library
   * We retry up to maxRetries times with a rateLimit interval between each try
   * @param {*} method
   * @param {*} params
   */
  async send(method, params) {
    return new Promise(async (resolve, reject) => {
      const sendOnce = async tries => {
        let response
        try {
          response = await providers.JsonRpcProvider.prototype.send.call(
            this,
            method,
            params
          )
        } catch (error) {
          if (error.statusCode === 429 && tries < this.maxRetries) {
            return setTimeout(() => {
              sendOnce(tries + 1)
            }, this.rateLimit)
          } else {
            return reject(error) // If not a timeout we bubble up the error.
          }
        }
        return resolve(response)
      }
      sendOnce(1)
    })
  }
}
