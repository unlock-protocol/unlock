import React from 'react'
import { connect } from 'react-redux'
import { KindOfModal, Dispatch } from '../../unlockTypes' // eslint-disable-line
import { QRDisplay, WalletCheck, styles } from './modal-templates'

interface Props {
  active: boolean
  kindOfModal: KindOfModal
  dispatch: Dispatch
  data?: any
}

const templates = {
  [KindOfModal.WalletCheckOverlay]: WalletCheck,
  [KindOfModal.QRDisplay]: QRDisplay,
}

export const FullScreenModal = ({
  active,
  kindOfModal,
  dispatch,
  data,
}: Props) => {
  let Template = templates[kindOfModal]

  if (active) {
    // render a modal
    return (
      <styles.Greyout>
        <Template dispatch={dispatch} data={data} />
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
    data?: any
  }
}

const mapStateToProps = (state: State) => {
  const {
    fullScreenModalStatus: { active, kindOfModal, data },
  } = state
  return {
    active,
    kindOfModal,
    data,
  }
}

export default connect(mapStateToProps)(FullScreenModal)
