import React from 'react'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../propTypes'
import withConfig from '../utils/withConfig'

class Error extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null

    // why did we previously automatically redirect to home?
    // at any rate, we cannot use Router here because Router doesn't exist server-side
    if (statusCode) {
      console.error(`Server-side error! ${statusCode}`, err) // eslint-disable-line
    }
    return { statusCode }
  }

  render() {
    const { config, statusCode } = this.props

    if (config.isServer) {
      return null
    }

    return (
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    )
  }
}

Error.propTypes = {
  statusCode: PropTypes.number.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(Error)
