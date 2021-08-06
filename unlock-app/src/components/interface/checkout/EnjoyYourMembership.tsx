import React from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'

interface EnjoyYourMembershipProps {
  closeModal: (success: boolean) => void
  redirectUri: string
}

export const EnjoyYourMembership = ({
  redirectUri,
  closeModal,
}: EnjoyYourMembershipProps) => {
  let label = 'Close'
  if (redirectUri) {
    const redirectUrl = new URL(redirectUri)
    label = `Return to ${redirectUrl.host}`
  }

  return (
    <EnjoyYourMembershipWrapper onClick={() => closeModal(true)}>
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
