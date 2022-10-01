import templates from '../../templates'

// Remove the default
let templatesToTest = { ...templates }
delete templatesToTest.default

describe('templates', () => {
  test.each(Object.keys(templatesToTest))('%s', (template) => {
    expect.assertions(2)
    expect(templatesToTest[template].subject).toBeInstanceOf(Function)
    const render =
      templatesToTest[template].html || templatesToTest[template].text
    expect(render).toBeInstanceOf(Function)
  })
})
