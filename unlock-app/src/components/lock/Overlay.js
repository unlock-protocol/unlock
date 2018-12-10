import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { RoundedLogo } from '../interface/Logo'
import Lock from './Lock'
import UnlockPropTypes from '../../propTypes'
import { hideModal, showModal } from '../../actions/modal'
import { unlockPage } from '../../services/iframeService'

export const Overlay = ({ locks, hideModal, showModal }) => (
  <FullPage>
    <Banner>
      <Headline>
        You have reached your limit of free articles. Please purchase access:
      </Headline>
      <Locks>
        {locks.map(lock => (
          <Lock
            key={JSON.stringify(lock)}
            lock={lock}
            hideModal={hideModal}
            showModal={showModal}
          />
        ))}
      </Locks>
      <Colophon>
        <RoundedLogo size="28px" />
        <p>Powered by Unlock</p>
      </Colophon>
    </Banner>
  </FullPage>
)

Overlay.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  hideModal: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
}

export const mapDispatchToProps = (dispatch, { locks }) => ({
  hideModal: () => {
    unlockPage()
    return dispatch(hideModal(locks.map(l => l.address).join('-')))
  },
  showModal: () => {
    dispatch(showModal(locks.map(l => l.address).join('-')))
  },
})

export default connect(
  null,
  mapDispatchToProps
)(Overlay)

const FullPage = styled.div`
  position: fixed; /* Sit on top of the page content */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const Banner = styled.div`
  position: fixed;
  display: grid;
  height: 30%;
  min-height: 375px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--offwhite);
  border: solid 1px var(--lightgrey);
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
`

const Colophon = styled.footer`
  display: grid;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  font-size: 12px;
  color: var(--darkgrey);

  & > * {
    justify-self: center;
  }
`
