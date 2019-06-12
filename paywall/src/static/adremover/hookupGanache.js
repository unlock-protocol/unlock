function hookupGanache() {
  const us = new URL(document.location)
  const provider = us.searchParams.get('provider') || 'http://localhost:8545'
  // create a proxy to the underlying JSON-RPC endpoint
  // a minimal JSON-RPC provider for use with web3Proxy.js in integration testing
  window.web3 = {
    currentProvider: {
      async sendAsync(payload, web3Cb) {
        try {
          const response = await fetch(provider, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })
          if (!response.ok) {
            web3Cb({ error: 'Cannot connect', code: response.status })
          }
          const json = await response.json()
          web3Cb(null, json)
        } catch (error) {
          web3Cb(error)
        }
      },
    },
  }
}

window.hookupGanache = hookupGanache
