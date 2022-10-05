interface FetchRecipientsDataOptions {
  recipients: string[]
  network: number
  lockAddress: string
}

export async function fetchRecipientsData(
  url: string,
  { lockAddress, network, recipients }: FetchRecipientsDataOptions
) {
  try {
    const result: string[] = []
    for (const recipient of recipients) {
      const endpoint = new URL(url)

      endpoint.searchParams.append('network', network.toString())
      endpoint.searchParams.append('lockAddress', lockAddress)
      endpoint.searchParams.append('recipient', recipient)

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
      result.push(data)
      return result
    }
  } catch (error) {
    console.error(error)
    return
  }
}
