/**
 * This module provides types and constructors for error values.
 * Example usage:
 *
 * import { StorageError } from '/path/to/Error.ts'
 * // oh no, an unrecoverable error has occurred!
 * const err = StorageError.Fatal('we ran out of magnetic tape.')
 * dispatch(setError(err))
 */

type ErrorLevel = 'Fatal' | 'Warning'

type ErrorKind =
  | 'ApplicationError'
  | 'FormValidationError'
  | 'LogInError'
  | 'SignUpError'
  | 'SignatureError'
  | 'StorageError'
  | 'TransactionError'

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

// Used for application level failures -- most of these will be fatal (wrong
// network, no provider...)
export const ApplicationError: ErrorMakers<'ApplicationError'> = {
  Fatal: fatalMaker('ApplicationError'),
  Warn: warningMaker('ApplicationError'),
}

// Used for errors in communicating with locksmith
export const StorageError: ErrorMakers<'StorageError'> = {
  Fatal: fatalMaker('StorageError'),
  Warn: warningMaker('StorageError'),
}

// Used for errors in signing data
export const SignatureError: ErrorMakers<'SignatureError'> = {
  Fatal: fatalMaker('SignatureError'),
  Warn: warningMaker('SignatureError'),
}

// Used for errors encountered while validating a form (invalid duration...)
export const FormValidationError: ErrorMakers<'FormValidationError'> = {
  Fatal: fatalMaker('FormValidationError'),
  Warn: warningMaker('FormValidationError'),
}

// errors that occur while logging in (wrong password...)
export const LogInError: ErrorMakers<'LogInError'> = {
  Fatal: fatalMaker('LogInError'),
  Warn: warningMaker('LogInError'),
}

// errors that occur while signing up/creating accounts
export const SignUpError: ErrorMakers<'SignUpError'> = {
  Fatal: fatalMaker('SignUpError'),
  Warn: warningMaker('SignUpError'),
}

// Transaction errors (failed to create lock, etc.)
export const TransactionError: ErrorMakers<'TransactionError'> = {
  Fatal: fatalMaker('TransactionError'),
  Warn: warningMaker('TransactionError'),
}
