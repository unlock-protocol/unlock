import PropTypes from 'prop-types'

import React from 'react'
import styled from 'styled-components'

import Layout from '../interface/Layout'

const defaultError = (
  <p>
    This is a generic error because something just broke but we’re not sure
    what.
  </p>
)

export const DefaultError = ({ title, children, illustration }) => (
  <Layout title="">
    <Container>
      <Image src={illustration} />
      <Message>
        <h1>{title}</h1>
        {children}
      </Message>
    </Container>
  </Layout>
)

DefaultError.propTypes = {
  illustration: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
}

DefaultError.defaultProps = {
  illustration: '/static/images/illustrations/error.svg',
  title: 'Fatal Error',
  children: defaultError,
}

const Container = styled.section`
  display: grid;
  row-gap: 16px;
  column-gap: 32px;
  border: solid 1px var(--lightgrey);
  grid-template-columns: 72px;
  grid-auto-flow: column;
  border-radius: 4px;
  align-items: center;
  padding: 32px;
  padding-bottom: 40px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    grid-auto-flow: row;
    padding: 16px;
  }
`

const Image = styled.img`
  width: 72px;
`

const Message = styled.div`
  display: grid;
  grid-gap: 16px;

  & > h1 {
    font-weight: bold;
    color: var(--red);
    margin: 0px;
    padding: 0px;
  }

  & > p {
    margin: 0px;
    padding: 0px;
    font-size: 16px;
    color: var(--dimgrey);
  }
`

export const WrongNetwork = ({ currentNetwork, requiredNetwork }) => (
  <DefaultError
    title="Network mismatch"
    illustration="/static/images/illustrations/network.svg"
  >
    <p>
      {`You’re currently on the ${currentNetwork} network but you need to be on the ${requiredNetwork} network. Please switch to ${requiredNetwork}.`}
    </p>
  </DefaultError>
)

WrongNetwork.propTypes = {
  currentNetwork: PropTypes.string.isRequired,
  requiredNetwork: PropTypes.string.isRequired,
}

export const MissingProvider = () => (
  <DefaultError
    title="Wallet missing"
    illustration="/static/images/illustrations/wallet.svg"
  >
    <p>
      It looks like you’re using an incompatible browser or are missig a crypto
      wallet. If you’re using Chrome or Firefox you can install
      {' '}
      <a href="https://metamask.io/">Metamask</a>
.
    </p>
  </DefaultError>
)

export default {
  DefaultError,
  WrongNetwork,
  MissingProvider,
}
