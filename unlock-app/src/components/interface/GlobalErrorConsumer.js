import React from 'react'
import PropTypes from 'prop-types'

import { GlobalErrorContext } from '../../utils/GlobalErrorProvider'
import Layout from './Layout'
import { mapErrorToComponent } from '../creator/FatalError'

const Consumer = GlobalErrorContext.Consumer

export const displayError = (error, errorMetadata, children) => {
  if (error) {
    const Error = mapErrorToComponent(error, errorMetadata)
    return <Layout title="">{Error}</Layout>
  }
  return <React.Fragment>{children}</React.Fragment>
}

export default function GlobalErrorConsumer({ displayError, children }) {
  return (
    <Consumer>
      {({ error, errorMetadata }) => {
        return displayError(error, errorMetadata, children)
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
