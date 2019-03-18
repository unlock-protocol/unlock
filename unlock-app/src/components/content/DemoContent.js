import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Head from 'next/head'

import UnlockPropTypes from '../../propTypes'
import DemoComponent from '../interface/Demo'
import { lockRoute } from '../../utils/routes'
import withConfig from '../../utils/withConfig'
import { pageTitle } from '../../constants'

/**
 * This is the actual demo page with JS which injects a paywall'ed iframe.
 * TODO: move this to the paywall app, where it belongs ;)
 * @param {*} lock
 * @param {*} domain
 */
const DemoContent = ({ lock, config: { paywallUrl, paywallScriptUrl } }) => {
  return (
    <Fragment>
      <Head>
        <title>{pageTitle('Demo')}</title>
      </Head>
      <DemoComponent>
        <script src={paywallScriptUrl} data-unlock-url={paywallUrl} />
        {lock && <meta name="lock" content={lock} />}
      </DemoComponent>
    </Fragment>
  )
}

DemoContent.propTypes = {
  lock: PropTypes.string,
  config: UnlockPropTypes.configuration.isRequired,
}

DemoContent.defaultProps = {
  lock: '',
}

export const mapStateToProps = ({ router }) => {
  const { lockAddress } = lockRoute(router.location.pathname)
  return {
    lock: lockAddress,
  }
}

export default withConfig(connect(mapStateToProps)(DemoContent))
