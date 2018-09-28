import PropTypes from 'prop-types'
import styled from 'styled-components'
import Logo from '../interface/icons/Unlock'
import React from 'react'

export const LockDetails = ({ name, ethPrice, fiatPrice }) => (
  <Lock>
    <Name>{name}</Name>
    <EtherPrice>{ethPrice} Eth</EtherPrice>
    <FiatPrice>${fiatPrice}</FiatPrice>
  </Lock>
)

LockDetails.propTypes = {
  name: PropTypes.string,
  ethPrice: PropTypes.string,
  fiatPrice: PropTypes.string,
}

export const Overlay = ({ locks }) => (
  <FullPage>
    <Banner>
      <Headline>You have reached your limit of free articles. Please purchase access:</Headline>
      <Locks>
        {locks.map((lock, key) => (
          <LockDetails key={key} name={lock.name} ethPrice={lock.ethPrice} fiatPrice={lock.fiatPrice} />
        ))}
      </Locks>
      <Colophon>
        <Logo width='28px' height='28px' />
        <p>Powered by Unlock</p>
      </Colophon>
    </Banner>
  </FullPage>
)

Overlay.propTypes = {
  locks: PropTypes.arrayOf(Object),
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
  width: 100%;
  height: 50%;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--offwhite);
  border: solid 1px var(--lightgrey);
  justify-items: center;
  padding-top: 32px;
  grid-gap: 24px;

`

const Headline = styled.h1`
  font-size: 20px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: var(--slate);
`

const Locks = styled.ul`
  display:grid;
  grid-auto-flow: column;
  grid-gap: 32px;
  list-style: none;
  margin: 0px;
  padding: 0px;
`

const Lock = styled.li`
  margin: 0px;
  padding: 0px;
  width: 200px;
  background-color: var(--white);
  font-family: 'IBM Plex Sans' ,'Helvetica Neue', Arial, sans-serif;
  justify-items: center;
  border-radius: 4px;
  height: 200px;
`

const Name = styled.header`
  display: grid;
  height: 40px;
  font-weight: 300px;
  justify-content: center;
  align-content: center;
  background-color: var(--lightgrey);
  font-size: 20px;
  color: var(--grey);
  border-radius: 4px;
  text-transform: capitalize;
`

const EtherPrice = styled.div`
  margin-top: 32px;
  display: grid;
  justify-content: center;
  align-content: center;
  font-size: 30px;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: bold;
`

const FiatPrice = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  font-size: 20px;
  margin-top: 8px;
`

const Colophon = styled.footer`
  display: grid;
  justify-content: center;

`
