import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Lock from './Lock'
import UnlockPropTypes from '../../propTypes'
import { hideModal, showModal } from '../../actions/modal'
import { unlockPage } from '../../services/iframeService'
import { LockedFlag } from './UnlockFlag'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { mapErrorToComponent } from '../creator/FatalError'
import { FATAL_NO_USER_ACCOUNT } from '../../errors'
import withConfig from '../../utils/withConfig'

export const displayError = isMainWindow =>
  function overlayDisplayError(error, errorMetadata, children) {
    const Error = mapErrorToComponent(error, errorMetadata)

    if (isMainWindow) {
      if (error) {
        return Error
      }
    } else {
      if (error && error !== FATAL_NO_USER_ACCOUNT) {
        return Error
      }
    }
    return <>{children}</>
  }

export const Overlay = ({
  locks,
  hideModal,
  showModal,
  scrollPosition,
  openInNewWindow,
  config: { isInIframe },
}) => (
  <FullPage>
    <Banner scrollPosition={scrollPosition}>
      <Headline>
        You have reached your limit of free articles. Please purchase access
      </Headline>
      <Locks>
        <GlobalErrorConsumer displayError={displayError(!isInIframe)}>
          {locks.map(lock => (
            <Lock
              key={JSON.stringify(lock)}
              lock={lock}
              hideModal={hideModal}
              showModal={showModal}
              openInNewWindow={openInNewWindow}
            />
          ))}
        </GlobalErrorConsumer>
      </Locks>
      <LockedFlag />
    </Banner>
  </FullPage>
)

Overlay.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  hideModal: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  scrollPosition: PropTypes.number.isRequired,
  openInNewWindow: PropTypes.bool.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export const mapStateToProps = ({ account }) => ({
  openInNewWindow: !account,
})

export const mapDispatchToProps = (dispatch, { locks }) => ({
  hideModal: () => {
    unlockPage()
    return dispatch(hideModal(locks.map(l => l.address).join('-')))
  },
  showModal: () => {
    dispatch(showModal(locks.map(l => l.address).join('-')))
  },
})

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Overlay)
)

const FullPage = styled.div`
  position: fixed; /* Sit on top of the page content */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    rgba(255, 255, 255, 0) 18%,
    rgba(255, 255, 255, 0) 29%,
    var(--offwhite) 48%
  );
`

const Banner = styled.div.attrs(({ scrollPosition }) => ({
  style: {
    height: Math.min(scrollPosition, 100) + '%',
  },
}))`
  position: fixed;
  display: grid;
  min-height: 375px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--offwhite);
  justify-items: center;
  padding: 32px;
  padding-bottom: 100px;
  grid-gap: 24px;
  align-self: center;
`

const Headline = styled.h1`
  font-size: 20px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: var(--slate);
  text-align: center;
`

const Locks = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 32px;
  list-style: none;
  margin: 0px;
  padding: 0px;
  grid-row: 2;
  grid-column: 1;
`
