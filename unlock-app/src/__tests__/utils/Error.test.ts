import {
  ApplicationError,
  FormValidationError,
  LogInError,
  SignUpError,
  SignatureError,
  StorageError,
  TransactionError,
} from '../../utils/Error'

describe('Error constructors', () => {
  it.each([
    ApplicationError,
    FormValidationError,
    LogInError,
    SignUpError,
    SignatureError,
    StorageError,
    TransactionError,
  ])('each of these carries the message passed to it', constructors => {
    expect.assertions(2)
    const fatalMessage = 'Not enough teapots, dumping core'
    const warning = 'Passwords must contain at least 43 different characters'
    expect(constructors.Fatal(fatalMessage).message).toBe(fatalMessage)
    expect(constructors.Warn(warning).message).toBe(warning)
  })
})
