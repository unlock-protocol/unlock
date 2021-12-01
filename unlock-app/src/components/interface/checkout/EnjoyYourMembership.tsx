import React, { useContext } from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

interface EnjoyYourMembershipProps {
  closeModal: (success: boolean, redirectUri: string, params?: any) => void
  redirectUri?: string
  signature?: string
}

export const EnjoyYourMembership = ({
  redirectUri,
  closeModal,
  signature,
}: EnjoyYourMembershipProps) => {
  let label = 'Close'
  if (redirectUri) {
    const redirectUrl = new URL(redirectUri)
    label = `Go to ${redirectUrl.host}`
  }

  return (
    <EnjoyYourMembershipWrapper
      onClick={() => {
        if (redirectUri) {
          closeModal(true, redirectUri, {
            signature,
          })
        } else {
          window.close()
        }
      }}
    >
      {label}
    </EnjoyYourMembershipWrapper>
  )
}

EnjoyYourMembership.defaultProps = {
  redirectUri: '',
}

const EnjoyYourMembershipWrapper = styled(ActionButton).attrs({})`
  margin-top: 20px;
  width: 100%;
  height: 48px;
  font-size: 18px;
`

export default EnjoyYourMembership
