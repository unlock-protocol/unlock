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
  border-top: 2px solid var(--darkgreen);
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

<<<<<<< HEAD
const Colophon = styled.footer`
  display: flex;
  flex-direction: row;
  align-content: center;
=======
export const Colophon = styled.footer`
  display: grid;
  justify-content: center;
>>>>>>> begin work on unlocked flag
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  font-size: 12px;
  color: var(--darkgrey);
  background-color: var(--white);
  justify-self: right;
  align-self: center;
  grid-row: 2;
  grid-column: 1;
  width: 120px;
  height: 80px;
  margin-right: -33px;

  & > * {
    justify-self: left;
    align-self: center;
    margin-left: -14px;
  }
  & > p {
    margin-left: auto;
    margin-right: auto;
    width: 63px;
    align-self: center;
    justify-self: center;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    font-size: 12px;
    color: var(--darkgrey);
  }
`
