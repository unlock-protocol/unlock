import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Logo from '../interface/Logo'
import Lock from './Lock'
import UnlockPropTypes from '../../propTypes'

export const Overlay = ({ locks }) => (
  <FullPage>
    <Banner>
      <Headline>You have reached your limit of free articles. Please purchase access:</Headline>
      <Locks>
        {locks.map((lock) => (
          <Lock key={lock.id} lock={lock} />
        ))}
      </Locks>
      <Colophon>
        <Logo size="28px" />
        <p>Powered by Unlock</p>
      </Colophon>
    </Banner>
  </FullPage>
)

Overlay.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock),
}

Overlay.defaultProps = {
  locks: [],
}

export default Overlay

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
  height: 50%;
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
  display:grid;
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
