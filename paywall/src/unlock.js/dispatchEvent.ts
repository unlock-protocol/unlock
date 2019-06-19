import { EventWindow } from '../windowTypes'

/**
 * create and dispatch an 'unlockProtocol' event with the given detail
 * @param {window} window the current global context (window, self)
 * @param {*} detail the custom data to pass along with the event
 */
export default function dispatchEvent(window: EventWindow, detail: any) {
  let event
  try {
    event = new window.CustomEvent('unlockProtocol', { detail })
  } catch (e) {
    // older browsers do events this clunky way.
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/initCustomEvent#Parameters
    event = window.document.createEvent('customevent')
    event.initCustomEvent(
      'unlockProtocol',
      true /* canBubble */,
      true /* cancelable */,
      detail
    )
  }
  window.dispatchEvent(event)
}
