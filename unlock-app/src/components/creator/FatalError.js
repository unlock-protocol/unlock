import PropTypes from 'prop-types'

import React from 'react'
import styled from 'styled-components'

const defaultError = (
  <p>
    This is a generic error because something just broke but we’re not sure
    what.
  </p>
)

export const DefaultError = ({ title, children, illustration, critical }) => (
  <Container>
    <Image src={illustration} />
    <Message critical={critical}>
      <h1>{title}</h1>
      {children}
    </Message>
  </Container>
)

DefaultError.propTypes = {
  illustration: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
  critical: PropTypes.bool,
}

DefaultError.defaultProps = {
  illustration: '/static/images/illustrations/error.svg',
  title: 'Fatal Error',
  children: defaultError,
  critical: true,
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
    color: ${props => (props.critical ? 'var(--red)' : 'var(--grey)')};
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
      It looks like you’re using an incompatible browser or are missing a crypto
      wallet. If you’re using Chrome or Firefox you can install{' '}
      <a href="https://metamask.io/">Metamask</a>.
    </p>
  </DefaultError>
)

export const MissingAccount = () => (
  <DefaultError title="Need account">
    <p>
      In order to display this content, you need to connect a crypto-wallet to
      your browser.
    </p>
  </DefaultError>
)

export const mapping = {
  FATAL_MISSING_PROVIDER: MissingProvider,
  FATAL_NO_USER_ACCOUNT: MissingAccount,
  FATAL_WRONG_NETWORK: WrongNetwork,
  '*': DefaultError,
}

export default {
  DefaultError,
  WrongNetwork,
  MissingProvider,
  MissingAccount,
}
