import React, { ReactNode } from 'react'
import propTypes from 'prop-types'
import { Greyout, MessageBox, Quit } from './modal-templates/styles'

interface Props {
  active: boolean
  dismiss: () => void
  children: ReactNode
}

export const InlineModal: React.FunctionComponent<Props> = ({
  children,
  active,
  dismiss,
  ...props
}) => {
  if (active) {
    return (
      <Greyout>
        <MessageBox {...props}>
          <Quit onClick={dismiss} />
          {children}
        </MessageBox>
      </Greyout>
    )
  }

  return null
}

InlineModal.propTypes = {
  active: propTypes.bool.isRequired,
  dismiss: propTypes.func.isRequired,
  children: propTypes.node.isRequired,
}

export default InlineModal
