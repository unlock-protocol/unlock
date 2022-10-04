interface FetchRecipientDataOptions {
  recipient: string
  network: number
  lockAddress: string
}

export async function fetchRecipientData(
  url: string,
  options: FetchRecipientDataOptions
) {
  try {
    const endpoint = new URL(url)

    endpoint.searchParams.append('network', options.network.toString())
    endpoint.searchParams.append('lockAddress', options.lockAddress)
    endpoint.searchParams.append('recipient', options.recipient)

    const abortController = new AbortController()

    const timer = setTimeout(() => {
      abortController.abort()
    }, 5000)

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
      signal: abortController.signal,
    })

    clearTimeout(timer)

    if (!response.ok) {
      throw new Error('Failed to fetch data.')
    }

    const data = await response.text()
    return data
  } catch {
    return null
  }
}
