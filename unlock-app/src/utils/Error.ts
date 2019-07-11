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
  | 'PostOffice'
  | 'SignUp'
  | 'Signature'
  | 'Storage'
  | 'Transaction'
  | 'Web3'

export type NetworkInfo = {
  currentNetwork: string
  requiredNetworkId: number
}

// Additional data that can be passed along with an error. Currently
// only used for required network info in a fatal error template.
export type DataPayload = NetworkInfo

export interface UnlockError {
  level: ErrorLevel
  kind: ErrorKind
  message: string
}

export interface FatalError extends UnlockError {
  level: 'Fatal'
  data?: DataPayload
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
  Fatal: (message: string, data?: DataPayload) => FatalError
  Warning: (message: string) => WarningError
  Diagnostic: (message: string) => DiagnosticError
}

const errorsFor = (kind: ErrorKind): ErrorMakers => ({
  Fatal: (message: string, data?: DataPayload) => ({
    message,
    kind,
    level: 'Fatal',
    data,
  }),
  Warning: (message: string) => ({ message, kind, level: 'Warning' }),
  Diagnostic: (message: string) => ({ message, kind, level: 'Diagnostic' }),
})

// Used for application level failures -- most of these will be fatal (wrong
// network, no provider...)
export const Application: ErrorMakers = errorsFor('Application')

// Used for errors in communicating with locksmith
export const Storage: ErrorMakers = errorsFor('Storage')

// Used for errors in signing data
export const Signature: ErrorMakers = errorsFor('Signature')

// Used for errors encountered while validating a form (invalid duration...)
export const FormValidation: ErrorMakers = errorsFor('FormValidation')

// errors that occur while logging in (wrong password...)
export const LogIn: ErrorMakers = errorsFor('LogIn')

// errors that happen when posting messages back and forth with the paywall
export const PostOffice: ErrorMakers = errorsFor('PostOffice')

// errors that occur while signing up/creating accounts
export const SignUp: ErrorMakers = errorsFor('SignUp')

// Transaction errors (failed to create lock, etc.)
export const Transaction: ErrorMakers = errorsFor('Transaction')

export const Web3: ErrorMakers = errorsFor('Web3')

const constructors: { [key: string]: ErrorMakers } = {
  Application,
  Storage,
  Signature,
  FormValidation,
  LogIn,
  PostOffice,
  SignUp,
  Transaction,
  Web3,
}

export default constructors
