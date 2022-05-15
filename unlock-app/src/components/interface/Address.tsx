import styled from 'styled-components'
import React from 'react'
import useEns from '../../hooks/useEns'

export interface AddressProps {
  address: string
  className?: string
  id?: string
}

const Address = ({ id, className, address }: AddressProps) => {
  const name = useEns(address)
  return (
    <Abbrevation id={id} className={className} title={address}>
      {name}
    </Abbrevation>
  )
}

Address.defaultProps = {
  className: '',
  id: '',
}

const Abbrevation = styled.abbr`
  border-bottom: none !important;
  cursor: inherit !important;
  text-decoration: none !important;
`

export default Address
