import React from 'react'
import styled from 'styled-components'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'

const defaultError = (
  <p>
    This is a generic error because something just broke but we’re not sure
    what.
  </p>
)

interface DefaultErrorProps {
  illustration: string
  title: string
  children: React.ReactNode
  critical: boolean
}
export const DefaultError = ({
  title,
  children,
  illustration,
  critical,
}: DefaultErrorProps) => (
  <Container>
    <img className="w-16" src={illustration} alt="error" />
    <Message critical={critical}>
      <h1>{title}</h1>
      {children}
    </Message>
  </Container>
)

export const FallbackError = () => (
  <DefaultError
    illustration="/images/illustrations/error.svg"
    title="Fatal Error"
    critical
  >
    {defaultError}
  </DefaultError>
)

const Container = styled.section`
  display: grid;
  row-gap: 16px;
  column-gap: 32px;
  border-radius: 4px;
  align-items: center;
  padding: 32px;
  padding-bottom: 40px;
  grid-template-columns: 50px repeat(auto-fill, minmax(1fr));
`

const Message = styled.div`
  display: grid;
  grid-gap: 16px;

  & > h1 {
    font-weight: bold;
    color: ${(props: { critical?: boolean }) =>
      props.critical ? 'var(--red)' : 'var(--grey)'};
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

export const NetworkNotSupported = () => (
  <DefaultError
    title="Network not supported"
    illustration="/images/illustrations/network.svg"
    critical
  >
    <p>Unlock is currently not supported on this Ethereum network.</p>
  </DefaultError>
)

export const NotEnabledInProvider = () => (
  <DefaultError
    title="Not enabled in provider"
    illustration="/images/illustrations/wallet.svg"
    critical
  >
    <p>You did not approve Unlock in your web3 wallet.</p>
  </DefaultError>
)

interface WrongNetworkProps {
  network: number
}
export const WrongNetwork = ({ network }: WrongNetworkProps) => {
  return (
    <DefaultError
      title="Wrong network"
      illustration="/images/illustrations/network.svg"
      critical
    >
      <p>
        You are on the wrong network. Please switch to{' '}
        <strong>{ETHEREUM_NETWORKS_NAMES[network]}</strong> in your wallet of
        choice.
      </p>
    </DefaultError>
  )
}
