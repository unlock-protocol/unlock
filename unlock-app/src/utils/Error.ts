/**
 * This module provides types and constructors for error values.
 * Example usage:
 *
 * import { StorageError } from '/path/to/Error.ts'
 * // oh no, an unrecoverable error has occurred!
 * const err = StorageError.Fatal('we ran out of magnetic tape.')
 * dispatch(setError(err))
 */

type ErrorLevel = 'Fatal' | 'Warning' | 'Diagnostic'

type ErrorKind =
  | 'Application'
  | 'FormValidation'
  | 'LogIn'
  | 'SignUp'
  | 'Signature'
  | 'Storage'
  | 'Transaction'

export interface UnlockError {
  level: ErrorLevel
  kind: ErrorKind
  message: string
}

export interface FatalError extends UnlockError {
  level: 'Fatal'
}

export function isFatalError(e: UnlockError): e is FatalError {
  return e.level === 'Fatal'
}

export interface WarningError extends UnlockError {
  level: 'Warning'
}

export function isWarningError(e: UnlockError): e is WarningError {
  return e.level === 'Warning'
}

export interface DiagnosticError extends UnlockError {
  level: 'Diagnostic'
}

export function isDiagnosticError(e: UnlockError): e is DiagnosticError {
  return e.level === 'Diagnostic'
}

interface ErrorMakers {
  Fatal: (message: string) => FatalError
  Warning: (message: string) => WarningError
  Diagnostic: (message: string) => DiagnosticError
}

const errorsFor = (kind: ErrorKind): ErrorMakers => ({
  Fatal: (message: string) => ({ message, kind, level: 'Fatal' }),
  Warning: (message: string) => ({ message, kind, level: 'Warning' }),
  Diagnostic: (message: string) => ({ message, kind, level: 'Diagnostic' }),
})

// Used for application level failures -- most of these will be fatal (wrong
// network, no provider...)
const Application: ErrorMakers = errorsFor('Application')

// Used for errors in communicating with locksmith
const Storage: ErrorMakers = errorsFor('Storage')

// Used for errors in signing data
const Signature: ErrorMakers = errorsFor('Signature')

// Used for errors encountered while validating a form (invalid duration...)
const FormValidation: ErrorMakers = errorsFor('FormValidation')

// errors that occur while logging in (wrong password...)
const LogIn: ErrorMakers = errorsFor('LogIn')

// errors that occur while signing up/creating accounts
const SignUp: ErrorMakers = errorsFor('SignUp')

// Transaction errors (failed to create lock, etc.)
const Transaction: ErrorMakers = errorsFor('Transaction')

const constructors: { [key: string]: ErrorMakers } = {
  Application,
  Storage,
  Signature,
  FormValidation,
  LogIn,
  SignUp,
  Transaction,
}

export default constructors
