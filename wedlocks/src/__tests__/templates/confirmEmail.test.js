import confirmEmail from '../../templates/confirmEmail'

describe('confirmEmail', () => {
  it('should have the right subject', () => {
    expect(confirmEmail.subject()).toBe('Please confirm your email address')
  })

  it('should have the right text', () => {
    expect(
      confirmEmail.text({
        confirmLink: 'https://unlock-protocol.com/confirm...'
      })
    ).toBe(
      'Please confirm your email address by clicking on the following link https://unlock-protocol.com/confirm....'
    )
  })
})
