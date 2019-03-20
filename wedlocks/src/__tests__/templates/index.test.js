import templates from '../../templates'

describe('templates', () => {
  test.each(Object.keys(templates))('%i', template => {
    expect(templates[template].subject).toBeInstanceOf(Function)
    expect(templates[template].text).toBeInstanceOf(Function)
  })
})
