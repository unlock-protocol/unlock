/**
 * create and dispatch an 'unlockProtocol' event with the given detail
 * @param {window} window the current global context (window, self)
 * @param {*} detail the custom data to pass along with the event
 */
export default function dispatchEvent(window, detail) {
  let event
  try {
    event = new window.CustomEvent('unlockProtocol', { detail })
  } catch (e) {
    // older browsers do events this clunky way.
    event = window.document.createEvent('customevent')
    event.initCustomEvent('unlockProtocol', true, true, detail)
  }
  window.dispatchEvent(event)
}
