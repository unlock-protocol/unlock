import React, { useContext } from 'react'
import { Item } from './styles'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import useEns from '../../../hooks/useEns'

export const AccountInfo = () => {
  const { account, email } = useContext(AuthenticationContext)
  const name = useEns(account || '')

  return (
    <div className="grid max-w-4xl gap-4 grid-cols-[repeat(12,[col-start]_1fr)">
      <div className="col-span-12 text-base font-bold leading-5">Account</div>
      {email && (
        <Item title="Email" count="half">
          <span className="flex h-5 mx-1 my-3 text-black">{email}</span>
        </Item>
      )}
      <Item title="Wallet Address" count="half">
        <span className="flex h-5 mx-1 my-3 text-black">{name}</span>
      </Item>
    </div>
  )
}
export default AccountInfo
