import PropTypes from 'prop-types'
import styled from 'styled-components'
import Logo from '../interface/Logo'
import React from 'react'
import Balance from '../helpers/Balance'

export const LockDetails = ({ name, keyPrice, fiatPrice }) => (
  <Lock>
    <Name>{name}</Name>
    <EtherPrice><Balance amount={keyPrice} /></EtherPrice>
    {fiatPrice &&
      <FiatPrice>${fiatPrice}</FiatPrice>
    }
    <PurchaseButton>Purchase</PurchaseButton>
  </Lock>
)

LockDetails.propTypes = {
  name: PropTypes.string,
  keyPrice: PropTypes.string,
  fiatPrice: PropTypes.string,
}

export const Overlay = ({ locks }) => (
  <FullPage>
    <Banner>
      <Headline>You have reached your limit of free articles. Please purchase access:</Headline>
      <Locks>
        {locks.map((lock, key) => (
          <LockDetails key={key} name={lock.name} keyPrice={lock.keyPrice} fiatPrice={lock.fiatPrice} />
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

const Lock = styled.li`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: stretch;
  margin: 0px;
  padding: 0px;
  width: 200px;
  background-color: var(--white);
  font-family: 'IBM Plex Sans' ,'Helvetica Neue', Arial, sans-serif;
  border-radius: 4px;
  height: 200px;
`

const PurchaseButton = styled.div`
  display: grid;
  height: 40px;
  font-weight: 300;
  align-self: end;
  justify-content: center;
  align-content: center;
  background-color: var(--lightgrey);
  border-radius: 0px 0px 4px 4px;

  &:hover {
    cursor: pointer;
    color: var(--white);
    background-color: var(--link);
  }
`

const Name = styled.header`
  display: grid;
  height: 40px;
  font-weight: 300;
  justify-content: center;
  align-content: center;
  background-color: var(--lightgrey);
  font-size: 20px;
  color: var(--grey);
  border-radius: 4px 4px 0px 0px;
  text-transform: capitalize;
`

const EtherPrice = styled.div`
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
  font-weight: 300;
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
