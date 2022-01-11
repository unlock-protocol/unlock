import React, { useContext } from 'react'
import styled from 'styled-components'
import Svg from '../svg'
import { ConfigContext } from '../../../utils/withConfig'

export const Form = styled.form``

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

export const Select = styled.select`
  height: 48px;
  width: 100%;
  border: thin var(--lightgrey) solid;
  border-radius: 4px;
  background-color: var(--lightgrey);
  font-size: 16px;
  padding: 0 8px;
  color: var(--darkgrey);
  margin-bottom: 16px;
  appearance: none;
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
`

export const NeutralButton = styled(Button)`
  background-color: var(--grey);
`

export const FormError = styled.p`
  font-size: 12px;
  color: var(--red);
  margin-bottom: 5px;
  margin-top: 5px;
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
