import React, { useContext } from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'
import { AuthenticationContext } from '../Authenticate'

interface EnjoyYourMembershipProps {
  closeModal: (success: boolean, redirectUri: string, params?: any) => void
  redirectUri: string
}

export const EnjoyYourMembership = ({
  redirectUri,
  closeModal,
}: EnjoyYourMembershipProps) => {
  let label = 'Close'
  if (redirectUri) {
    const redirectUrl = new URL(redirectUri)
    label = `Go to ${redirectUrl.host}`
  }
  const { signedMessage } = useContext(AuthenticationContext)

  return (
    <EnjoyYourMembershipWrapper
      onClick={() =>
        closeModal(true, redirectUri, {
          signature: signedMessage,
        })
      }
    >
      {label}
    </EnjoyYourMembershipWrapper>
  )
}

export const EnjoyYourMembershipWrapper = styled(ActionButton).attrs({})`
  margin-top: 20px;
  width: 100%;
  height: 48px;
  font-size: 18px;
`

export default EnjoyYourMembership
