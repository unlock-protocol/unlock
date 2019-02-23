/**
 * poll at a regular interval, with the ability to pause polling or end it
 */
export default function pollWithConditions(
  pollingCallback,
  intervalMs,
  disablePolling,
  handleError = () => {}
) {
  async function poll() {
    try {
      if (disablePolling()) return
      await pollingCallback()
      setTimeout(poll, intervalMs)
    } catch (e) {
      // if the conditionsCallback throws, we stop the loop
      // and pass the error out to an external handler, if any
      handleError(e)
    }
  }
  poll()
}
