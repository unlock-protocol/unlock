/**
 * Helper function to send a request to POAP when a
 * user is checked-in.
 * @param {*} key
 * @param {*} signature
 * @param {*} timestamp
 */
export const pingPoap = (key, owner, signature, timestamp) => {
  try {
    // Only on the web!
    if (typeof fetch !== 'undefined') {
      fetch('https://api.poap.xyz/tasks/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'a75495d2-c9c5-494c-9ba4-80976b371bae',
        },
        body: JSON.stringify({
          accountAddress: owner,
          lockAddress: key.lock.address,
          timestamp,
          signature,
        }),
      })
    }
  } catch (e) {
    // Fail silently. Our POAP integration is best effort.
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

export default pingPoap
