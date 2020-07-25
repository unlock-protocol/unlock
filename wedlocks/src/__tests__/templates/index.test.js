import templates from '../../templates'

describe('templates', () => {
  test.each(Object.keys(templates))('%i', (template) => {
    expect.assertions(2)
    expect(templates[template].subject).toBeInstanceOf(Function)
    expect(templates[template].text).toBeInstanceOf(Function)
  })
})
