import React from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'

import UnlockPropTypes from '../propTypes'
import withConfig from '../utils/withConfig'

class Error extends React.Component {
  static getInitialProps({ res, err, req }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null

    // redirect to home now if not found
    if (statusCode) {
      const configure = require('../config').default
      const config = configure()
      if (
        config.env !== 'production' &&
        req.connection.remoteAddress.match(/^127.0.0.1|^localhost/)
      ) {
        console.log('Server-side error!', err) // eslint-disable-line
      } else {
        res.writeHead(301, {
          Location: '/',
        })
        res.end()
      }
    } else {
      Router.push('/')
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
