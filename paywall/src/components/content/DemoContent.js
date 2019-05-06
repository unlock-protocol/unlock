import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Head from 'next/head'

import DemoComponent from '../interface/Demo'
import { lockRoute } from '../../utils/routes'
import { pageTitle } from '../../constants'

/**
 * This is the actual demo page with JS which injects a paywall'ed iframe.
 * @param {*} lock
 * @param {*} domain
 */
const DemoContent = ({ lock, paywallUrl }) => {
  return (
    <Fragment>
      <Head>
        <title>{pageTitle('Demo')}</title>
      </Head>
      <DemoComponent>
        <script
          src={paywallUrl + '/static/paywall.min.js'}
          data-unlock-url={paywallUrl}
        />
        {lock && <meta name="lock" content={lock} />}
      </DemoComponent>
    </Fragment>
  )
}

DemoContent.propTypes = {
  lock: PropTypes.string,
  paywallUrl: PropTypes.string.isRequired,
}

DemoContent.defaultProps = {
  lock: '',
}

export const mapStateToProps = ({ router }) => {
  const { lockAddress } = lockRoute(router.location.pathname)

  // note: the choice of 127.0.0.1 instead of localhost is deliberate, as it will
  // allow us to test cross-origin requests from localhost/demo
  let paywallUrl
  if (global.window && window.origin === 'http://localhost:3001') {
    paywallUrl = 'http://127.0.0.1:3001'
  } else if (global.window) {
    paywallUrl = window.origin
  } else {
    // server-side, it doesn't matter what we render
    paywallUrl = ''
  }
  return {
    lock: lockAddress,
    paywallUrl,
  }
}

export default connect(mapStateToProps)(DemoContent)
