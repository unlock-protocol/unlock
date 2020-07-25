import React from 'react'
import { connect } from 'react-redux'
import { KindOfModal, Dispatch } from '../../unlockTypes' // eslint-disable-line
import { WalletCheck, styles } from './modal-templates'

const templates = {
  [KindOfModal.WalletCheckOverlay]: WalletCheck,
}

interface FullScreenModalProps {
  active: boolean
  kindOfModal: KindOfModal
  dispatch: Dispatch
}

export const FullScreenModal = (props: FullScreenModalProps) => {
  // eslint-disable-next-line react/prop-types
  const { kindOfModal, active, dispatch } = props
  const Template = templates[kindOfModal]

  if (active) {
    // render a modal
    return (
      <styles.Greyout>
        <Template dispatch={dispatch} />
      </styles.Greyout>
    )
  }
  // Otherwise do nothing
  return null
}

interface State {
  fullScreenModalStatus: {
    active: boolean
    kindOfModal: KindOfModal
  }
}

const mapStateToProps = (state: State) => {
  const {
    fullScreenModalStatus: { active, kindOfModal },
  } = state
  return {
    active,
    kindOfModal,
  }
}

export default connect(mapStateToProps)(FullScreenModal)
