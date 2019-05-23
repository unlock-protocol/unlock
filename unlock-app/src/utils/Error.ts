/**
 * This module provides types and constructors for error values.
 * Example usage:
 *
 * import { StorageError } from '/path/to/Error.ts'
 * // oh no, an unrecoverable error has occurred!
 * dispatch(StorageError.Fatal('we ran out of magnetic tape.'))
 */

type ErrorLevel = 'Fatal' | 'Warning'

type ErrorKind =
  | 'StorageError'
  | 'SignatureError'
  | 'FormValidationError'
  | 'LogInError'
  | 'SignUpError'

interface UnlockError<L extends ErrorLevel, K extends ErrorKind> {
  level: L
  kind: K
  message: string
}

// We very purposely do not export these: error messaging should be centralized
// here. We want to avoid ad-hoc creation of unhandled error types.
function fatalMaker<K extends ErrorKind>(kind: K) {
  return (message: string): UnlockError<'Fatal', K> => ({
    level: 'Fatal',
    kind,
    message,
  })
}

function warningMaker<K extends ErrorKind>(kind: K) {
  return (message: string): UnlockError<'Warning', K> => ({
    level: 'Warning',
    kind,
    message,
  })
}

// This is here to enforce that the Fatal property of a group of error
// constructors will actually be fatal -- no accidentally ignored errors.
interface ErrorMakers<K extends ErrorKind> {
  Fatal: (message: string) => UnlockError<'Fatal', K>
  Warn: (message: string) => UnlockError<'Warning', K>
}

export const StorageError: ErrorMakers<'StorageError'> = {
  Fatal: fatalMaker('StorageError'),
  Warn: warningMaker('StorageError'),
}

export const SignatureError: ErrorMakers<'SignatureError'> = {
  Fatal: fatalMaker('SignatureError'),
  Warn: warningMaker('SignatureError'),
}

export const FormValidationError: ErrorMakers<'FormValidationError'> = {
  Fatal: fatalMaker('FormValidationError'),
  Warn: warningMaker('FormValidationError'),
}

export const LogInError: ErrorMakers<'LogInError'> = {
  Fatal: fatalMaker('LogInError'),
  Warn: warningMaker('LogInError'),
}

export const SignUpError: ErrorMakers<'SignUpError'> = {
  Fatal: fatalMaker('SignUpError'),
  Warn: warningMaker('SignUpError'),
}
