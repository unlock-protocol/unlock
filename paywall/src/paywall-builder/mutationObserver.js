/**
 * This file is the core of the paywall script. It listens for changes to the <head></head> component
 * and looks for a <meta name="lock" content="..." /> and pulls the lock address out of the content.
 */
import { findLocks } from './script'

export default function listenForNewLocks(callback, fail, head) {
  const existingLock = findLocks(head)
  if (existingLock) {
    return callback(existingLock)
  }
  fail()
}
