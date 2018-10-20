import React from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'

class Error extends React.Component {
  static getInitialProps ({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null

    // redirect to home now if not found
    if (statusCode) {
      res.writeHead(301, {
        Location: '/',
      })
      res.end()
    } else {
      Router.push('/')
    }

    return { statusCode }
  }

  render () {
    const isServer = typeof window === 'undefined'

    if (isServer) {
      return null
    }

    return (
      <p>
        {this.props.statusCode
          ? `An error ${this.props.statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    )
  }
}

Error.propTypes = {
  statusCode: PropTypes.number,
}

export default Error
