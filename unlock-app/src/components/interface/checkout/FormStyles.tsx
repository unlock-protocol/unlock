import React, { useContext } from 'react'
import styled from 'styled-components'
import Svg from '../svg'
import { ConfigContext } from '../../../utils/withConfig'

export const Input = styled.input`
  height: 48px;
  width: 100%;
  border: thin var(--lightgrey) solid;
  border-radius: 4px;
  background-color: var(--lightgrey);
  font-size: 16px;
  padding: 0 8px;
  color: var(--darkgrey);
  margin-bottom: 16px;

  &::placeholder {
    color: var(--grey);
    font-weight: 300;
  }
`

export const Label = styled.label`
  font-size: 10px;
  line-height: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--grey);
  margin-bottom: 3px;
`

export const SmallButton = styled.button`
  margin-top: 0.25rem;
  margin-left: auto;
  cursor: pointer;
  font-size: 0.7em;
  font-weight: 500;
  color: var(--grey);
  float: right;
  width: unset;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

export const Button = styled.button`
  height: 48px;
  width: 100%;
  border: none;
  background-color: var(--green);
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  &[disabled] {
    background-color: var(--grey);
    cursor: not-allowed;
    color: white;
    opacity: 0.5;
  }
  margin-top: 16px;

  & svg {
    margin-left: 16px;
    height: 24px;
    fill: var(--white);
  }

  &:hover {
    background-color: ${(props) =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};
  }

  &[type='reset'],
  &[type='submit'],
  &[type='button'] {
    background-color: var(--green);
  }
  &[type='submit']:hover,
  &[type='reset']:hover,
  &[type='button']:hover {
    background-color: ${(props) =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};
  }
`

export const NeutralButton = styled(Button)`
  background-color: var(--grey);
`

interface LoadingButtonProps {
  children: React.ReactNode
}

export const LoadingButton = ({ children, ...props }: LoadingButtonProps) => (
  <Button {...props} disabled>
    {children}
    <Svg.Loading title="loading" alt="loading" />
  </Button>
)

interface TransactionPendingButtonProps {
  network: number
  transaction: string
}

export const TransactionPendingButton = ({
  network,
  transaction,
  ...props
}: TransactionPendingButtonProps) => {
  const config: any = useContext(ConfigContext)
  return (
    <LoadingButton {...props}>
      Transaction Mining{' '}
      {transaction && (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={config.networks[network].explorer.urls.transaction(transaction)}
        >
          ↗
        </a>
      )}
    </LoadingButton>
  )
}

export const LinkButton = styled.a`
  cursor: pointer;
`
