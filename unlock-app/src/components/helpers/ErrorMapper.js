/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React from 'react'
import * as errors from '../../actions/error'

export const messageTemplates = {
  [errors.WEB3_ERROR]: {
    validate: error =>
      error.metadata &&
      error.metadata.originalError &&
      error.metadata.originalError.message,
    en: ({ originalError: { message } }) => <p>Web3 error: {message}</p>,
    fr: ({ originalError: { message } }) => <p>Web3 erreur: {message}</p>,
  },
  [errors.SET_ERROR]: {
    validate: error => typeof error === 'string',
    en: error => <p>{error}</p>,
  },
}

export function ErrorMapper({ error, locale }) {
  if (!messageTemplates[error.type].validate(error)) {
    throw new Error('Internal error: improperly formatted error')
  }
  const template =
    messageTemplates[error.type][locale] || messageTemplates[error.type].en
  return template(error.metadata ? error.metadata : error)
}
