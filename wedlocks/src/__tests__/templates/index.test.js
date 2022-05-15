import templates from '../../templates'

describe('templates', () => {
  test.each(Object.keys(templates))('%s', (template) => {
    expect.assertions(2)
    expect(templates[template].subject).toBeInstanceOf(Function)
    const render = templates[template].html || templates[template].text
    expect(render).toBeInstanceOf(Function)
  })
})
