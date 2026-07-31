const RETRY_DELAYS_MS = [1000, 3000]

export const notifyCheckoutHook = async (
  url: string,
  payload: unknown,
  attempt = 0
): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      return
    }
  } catch (error) {
    console.warn('Unlock checkout hook notification failed', error)
  }

  const delay = RETRY_DELAYS_MS[attempt]
  if (delay === undefined) {
    return
  }

  setTimeout(() => {
    void notifyCheckoutHook(url, payload, attempt + 1)
  }, delay)
}
