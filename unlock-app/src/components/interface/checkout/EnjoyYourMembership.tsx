import React from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'

interface EnjoyYourMembershipProps {
  closeModal: (success: boolean) => void
}

export const EnjoyYourMembership = ({
  closeModal,
}: EnjoyYourMembershipProps) => {
  return (
    <EnjoyYourMembershipWrapper onClick={() => closeModal(true)}>
      Enjoy your membership!
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
