import React from 'react'
import styled from 'styled-components'
import { ActionButton } from '../buttons/ActionButton'

interface EnjoyYourMembershipProps {
  emitCloseModal: () => void
}

export const EnjoyYourMembership = ({
  emitCloseModal,
}: EnjoyYourMembershipProps) => {
  return (
    <EnjoyYourMembershipWrapper onClick={emitCloseModal}>
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
