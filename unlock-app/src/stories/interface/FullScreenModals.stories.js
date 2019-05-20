import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { FullScreenModal } from '../../components/interface/FullScreenModals'
import {
  WalletCheck,
  PasswordPrompt,
  ResetPasswordPrompt,
} from '../../components/interface/modal-templates'
import { KindOfModal } from '../../unlockTypes'
import doNothing from '../../utils/doNothing'

const emailState = {
  userDetails: {
    email: 'geoff@bitconnect.gov',
  },
}

const store = {
  getState: () => emailState,
  subscribe: () => doNothing,
}

storiesOf('Full Screen Modals', module)
  .add('The Wallet Check Overlay', () => {
    return (
      <FullScreenModal
        active
        kindOfModal={KindOfModal.WalletCheckOverlay}
        dispatch={doNothing}
      />
    )
  })
  .add('The Wallet Check Overlay, inactive', () => {
    // This is supposed to not render anything.
    return (
      <FullScreenModal
        active={false}
        kindOfModal={KindOfModal.WalletCheckOverlay}
        dispatch={doNothing}
      />
    )
  })
  .add('The Password Prompt Overlay', () => {
    return (
      <FullScreenModal
        active
        kindOfModal={KindOfModal.PasswordPrompt}
        dispatch={doNothing}
      />
    )
  })
  .add('The Password Prompt Overlay, inactive', () => {
    // This is supposed to not render anything.
    return (
      <FullScreenModal
        active={false}
        kindOfModal={KindOfModal.PasswordPrompt}
        dispatch={doNothing}
      />
    )
  })
  .add('The Password Reset Prompt Overlay', () => {
    // This one needs a provider because ResetPasswordPrompt needs to read the
    // user's email address from state.
    return (
      <Provider store={store}>
        <FullScreenModal
          active
          kindOfModal={KindOfModal.ResetPasswordPrompt}
          dispatch={doNothing}
        />
      </Provider>
    )
  })
  .add('The Password Reset Prompt Overlay, inactive', () => {
    // This is supposed to not render anything.
    return (
      <FullScreenModal
        active={false}
        kindOfModal={KindOfModal.ResetPasswordPrompt}
        dispatch={doNothing}
      />
    )
  })

storiesOf('Full Screen Modals/templates', module)
  .add('The Wallet Check Overlay', () => {
    return <WalletCheck dispatch={doNothing} />
  })
  .add('The Password Prompt Overlay', () => {
    return <PasswordPrompt dispatch={doNothing} />
  })
  .add('The Password Reset Prompt Overlay', () => {
    // This one needs a provider because ResetPasswordPrompt needs to read the
    // user's email address from state.
    return (
      <Provider store={store}>
        <ResetPasswordPrompt dispatch={doNothing} />
      </Provider>
    )
  })
