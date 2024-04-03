const { assert } = require('chai')
const { isBigNumber } = require('./bigNumber')

function notExpectEvent(events, eventName) {
  assert(events.find(({ event }) => event !== eventName))
}

function contains(args, key, value) {
  assert.equal(key in args, true, `Event argument '${key}' not found`)

  if (value === null) {
    assert.equal(
      args[key],
      null,
      `asserted event argument '${key}' to be null but got ${args[key]}`
    )
  } else if (isBigNumber(args[key]) || isBigNumber(value)) {
    const actual = isBigNumber(args[key]) ? args[key].toString() : args[key]
    const asserted = isBigNumber(value) ? value.toString() : value
    assert.equal(
      actual,
      asserted,
      `asserted event argument '${key}' to have value ${asserted} but got ${actual}`
    )
  } else {
    assert.equal(
      args[key],
      value,
      `asserted event argument '${key}' to have value ${value} but got ${args[key]}`
    )
  }
}

function expectEvent(events, eventName, eventArgs = {}) {
  const relevantEvents = events.filter(({ event }) => event === eventName)
  assert(relevantEvents.length > 0, `No '${eventName}' events found`)

  const exception = []
  const event = events.find(function (e) {
    for (const [k, v] of Object.entries(eventArgs)) {
      try {
        contains(e.args, k, v)
      } catch (error) {
        exception.push(error)
        return false
      }
    }
    return true
  })

  if (event === undefined) {
    throw exception[0]
  }

  return event
}

module.exports = {
  notExpectEvent,
  expectEvent,
}
