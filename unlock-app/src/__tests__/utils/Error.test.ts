import Error, {
  isFatalError,
  isWarningError,
  isDiagnosticError,
} from '../../utils/Error'

describe('Error constructors', () => {
  for (let name in Error) {
    describe(name, () => {
      it('should carry the message param on all methods', () => {
        expect.assertions(3)
        const message = 'This is a message'

        expect(Error[name].Fatal(message)).toEqual(
          expect.objectContaining({
            message,
          })
        )
        expect(Error[name].Warning(message)).toEqual(
          expect.objectContaining({
            message,
          })
        )
        expect(Error[name].Diagnostic(message)).toEqual(
          expect.objectContaining({
            message,
          })
        )
      })

      it('should construct the right kind of errors', () => {
        expect.assertions(3)
        const message = 'This is a message'

        expect(Error[name].Fatal(message)).toEqual(
          expect.objectContaining({
            kind: name,
          })
        )
        expect(Error[name].Warning(message)).toEqual(
          expect.objectContaining({
            kind: name,
          })
        )
        expect(Error[name].Diagnostic(message)).toEqual(
          expect.objectContaining({
            kind: name,
          })
        )
      })
    })
  }
})

describe('type guards', () => {
  const errors = [
    Error.Storage.Fatal('Not enough teapots.'),
    Error.Signature.Warning('Pen running low on ink, refill and try again'),
    Error.FormValidation.Diagnostic(
      'Just letting you know that I validated the form'
    ),
  ]
  describe('isFatalError', () => {
    it('should pick out only FatalErrors', () => {
      expect.assertions(2)
      const filteredErrors = errors.filter(isFatalError)
      expect(filteredErrors.length).toBe(1)
      // This last check is kind of redundant with the type system
      expect(filteredErrors[0].level).toEqual('Fatal')
    })
  })
  describe('isWarningError', () => {
    it('should pick out only WarningErrors', () => {
      expect.assertions(2)
      const filteredErrors = errors.filter(isWarningError)
      expect(filteredErrors.length).toBe(1)
      expect(filteredErrors[0].level).toEqual('Warning')
    })
  })
  describe('isDiagnosticError', () => {
    it('should pick out only DiagnosticErrors', () => {
      expect.assertions(2)
      const filteredErrors = errors.filter(isDiagnosticError)
      expect(filteredErrors.length).toBe(1)
      expect(filteredErrors[0].level).toEqual('Diagnostic')
    })
  })
})
