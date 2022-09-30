interface FetchDataOptions {
  recipients: string[]
  network: number
  lockAddress: string
}

export async function fetchData(url: string, options: FetchDataOptions) {
  try {
    const endpoint = new URL(url)
    endpoint.searchParams.append('network', options.network.toString())
    endpoint.searchParams.append('lockAddress', options.lockAddress)

    for (const recipient of options.recipients) {
      endpoint.searchParams.append('recipients[]', recipient)
    }

    const abortController = new AbortController()

    const timer = setTimeout(() => {
      abortController.abort()
    }, 5000)

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    })

    clearTimeout(timer)

    if (!response.ok) {
      throw new Error('Failed to fetch data.')
    }

    const json = await response.json()
    return json.data as string[]
  } catch {
    return null
  }
}
