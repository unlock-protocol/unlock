import React from 'react'
import PropTypes from 'prop-types'

import { GlobalErrorContext } from '../../utils/GlobalErrorProvider'
import { mapping } from '../creator/FatalError'
import Layout from './Layout'

const Consumer = GlobalErrorContext.Consumer

export const displayError = (error, children) => {
  if (error) {
    return <Layout title="">{error}</Layout>
  }
  return <>{children}</>
}

export default function GlobalErrorConsumer({ displayError, children }) {
  return (
    <Consumer>
      {({ error, errorMetadata }) => {
        // if the error condition exists, set it to the mapped fatal error component
        // or to the fallback
        // if no error exists, set it to false
        const Error = error ? mapping[error] || mapping['*'] : false

        // call displayError with either false or the error element, and our child elements
        return displayError(Error && <Error {...errorMetadata} />, children)
      }}
    </Consumer>
  )
}

GlobalErrorConsumer.propTypes = {
  children: PropTypes.node.isRequired,
  displayError: PropTypes.func,
}

GlobalErrorConsumer.defaultProps = {
  displayError,
}
