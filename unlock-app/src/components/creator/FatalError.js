import PropTypes from 'prop-types'

import React from 'react'
import styled from 'styled-components'

import Layout from '../interface/Layout'

const defaultError = (<p>This is a generic error because something just broke but we’re not sure what.</p>)

export const DefaultError = ({ title = 'Fatal Error', children = defaultError, illustration = '/static/images/illustrations/error.svg' }) => (
  <Layout title="Creator Dashboard">
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

const Container = styled.section`
  display: grid;
  grid-template-columns: 72px 1fr;
  row-gap: 16px;
  column-gap: 32px;
  border: solid 1px var(--lightgrey);
  border-radius: 4px;
  align-items: center;
  padding: 32px;
  padding-bottom: 40px;
  padding-right: 160px;
`

const Image = styled.img``

const Message = styled.div`
  display: grid;
  grid-gap: 16px;

  &>h1 {
    font-weight: bold;
    color: var(--red);
    margin: 0px;
    padding: 0px;
  }

  &>p {
    margin: 0px;
    padding: 0px;
    font-size: 16px;
      color: var(--dimgrey);
  }
`

export const WrongNetwork = ({currentNetwork, requiredNetwork}) => (
  <DefaultError
    title="Network mismatch"
    illustration={'/static/images/illustrations/network.svg'}>
    <p>You’re currently on the {currentNetwork} network but you need to be on the {requiredNetwork} network. Please switch to {requiredNetwork}.</p>
  </DefaultError>)
WrongNetwork.propTypes = {
  currentNetwork: PropTypes.string,
  requiredNetwork: PropTypes.string,
}

export const MissingProvider= () => (
  <DefaultError
    title="Wallet missing"
    illustration={'/static/images/illustrations/wallet.svg'}>
    <p>
      It looks like you’re using an incompatible browser or are missig a crypto wallet. If you’re using Chrome or Firefox you can install <a href='https://metamask.io/'>Metamask</a>.
    </p>
  </DefaultError>)

export default {
  DefaultError,
  WrongNetwork,
  MissingProvider,
}
