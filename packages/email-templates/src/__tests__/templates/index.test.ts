import templates from '../../index'
import { prepareAll } from '../../templates/prepare'
import { describe, test } from 'vitest'
// Remove the default
let templatesToTest = { ...templates }
delete templatesToTest.default

describe('templates', () => {
  test.each(Object.keys(templatesToTest))('%s', (template) => {
    expect.assertions(2)
    const prepared = prepareAll(templatesToTest[template])
    expect(prepared.subject).toBeInstanceOf(Function)
    const render = prepared.html || prepared.text
    expect(render).toBeInstanceOf(Function)
  })
})
