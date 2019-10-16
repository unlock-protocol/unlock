import React from 'react'
import {
  Grid,
  SectionHeader,
  Column,
  Description,
  Box,
  DangerHeader,
  SuperWarning,
  DangerIllustration,
  Checkbox,
  SubmitButton,
  DisabledButton,
} from './styles'
import { EncryptedPrivateKey } from '../../../unlockTypes'

interface EjectAccountProps {
  encryptedPrivateKey: EncryptedPrivateKey
}

export function EjectAccount({ encryptedPrivateKey }: EjectAccountProps) {
  return (
    <Grid>
      <SectionHeader>Export Account</SectionHeader>
      <Column size="full">
        <Description>
          Exporting your account will eject it from the Unlock platform. You
          will be able to import your account into a Web3 wallet such as
          MetaMask, but it will also remove your account from Unlock
          permanently, along with the ability to recover it with the link in
          your welcome email.
        </Description>
        <Box>
          <div>
            <DangerIllustration />
          </div>
          <div>
            <DangerHeader>Danger Zone</DangerHeader>
            <Description>
              Clicking the Eject Account button below will delete your Unlock
              account and download a JSON file containing your encrypted private
              key. You can import the JSON file into a Web3 wallet using your
              account password.{' '}
              <SuperWarning>
                Do not lose this file, we cannot recover it if you do.
              </SuperWarning>
            </Description>
            <EjectionForm encryptedPrivateKey={encryptedPrivateKey} />
          </div>
        </Box>
      </Column>
    </Grid>
  )
}

interface EjectionFormProps {
  encryptedPrivateKey: EncryptedPrivateKey
}

interface EjectionFormState {
  checked: boolean
}

export class EjectionForm extends React.Component<
  EjectionFormProps,
  EjectionFormState
> {
  constructor(props: EjectionFormProps) {
    super(props)
    this.state = {
      checked: false,
    }
  }

  toggleChecked = () => {
    const { checked } = this.state
    this.setState({
      checked: !checked,
    })
  }

  submitButton = () => {
    const { checked } = this.state
    if (checked) {
      return <SubmitButton>Eject</SubmitButton>
    }
    return <DisabledButton>Eject</DisabledButton>
  }

  render() {
    const { checked } = this.state
    return (
      <form>
        <label htmlFor="ejection-confirmation-checkbox">
          <Checkbox
            id="ejection-confirmation-checkbox"
            checked={checked}
            onChange={this.toggleChecked}
          />
          <SectionHeader>
            Yes, I want to export and delete my account
          </SectionHeader>
          {this.submitButton()}
        </label>
      </form>
    )
  }
}

export default EjectAccount
