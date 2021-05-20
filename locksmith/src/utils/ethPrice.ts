const https = require('https')

// DEPRECATED!
export const getPrice = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
    https
      .get('https://api.coinbase.com/v2/prices/ETH-USD/buy', (resp: any) => {
        let data = ''

        // A chunk of data has been recieved.
        resp.on('data', (chunk: string) => {
          data += chunk
        })

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          const body = JSON.parse(data)
          resolve(parseFloat(body.data.amount))
        })
      })
      .on('error', (err: any) => {
        reject(err)
      })
  })
}
