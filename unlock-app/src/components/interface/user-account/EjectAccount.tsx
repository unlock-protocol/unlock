import React from 'react'
import { connect } from 'react-redux'
import FileSaver from 'file-saver'
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
  OrderedList,
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
          Exporting your account will eject it from the Unlock platform. The
          following things will happen:
        </Description>
        <OrderedList>
          <li>
            A JSON file will be downloaded to your computer. This file includes
            your private key, encrypted with your Unlock password. You should
            then import it into a wallet like MetaMask.
          </li>
          <li>
            Your Unlock account will be deleted permanently, including all
            personal information.
          </li>
          <li>
            After that, you will not be able to log back in with Unlock and the
            recovery link we sent by email will not work anymore either.
          </li>
        </OrderedList>
        <Box>
          <div>
            <DangerIllustration />
          </div>
          <div>
            <DangerHeader>Danger Zone</DangerHeader>
            <SuperWarning>
              Clicking the eject button below is final. There is no way back
              after that. Do not delete the JSON file until you have safely
              imported it in another crypto wallet.
            </SuperWarning>
            <EjectionForm
              download={downloadObjectAsJSON}
              encryptedPrivateKey={encryptedPrivateKey}
            />
          </div>
        </Box>
      </Column>
    </Grid>
  )
}

interface ReduxState {
  userDetails: {
    key: EncryptedPrivateKey
  }
}

export const mapStateToProps = ({
  userDetails: { key },
}: ReduxState): EjectAccountProps => {
  return {
    encryptedPrivateKey: key,
  }
}

export default connect(mapStateToProps)(EjectAccount)

interface EjectionFormProps {
  encryptedPrivateKey: EncryptedPrivateKey
  download: typeof downloadObjectAsJSON
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
    const { download, encryptedPrivateKey } = this.props
    const { checked } = this.state
    if (checked) {
      return (
        <SubmitButton
          onClick={() => {
            download(encryptedPrivateKey, 'encrypted-private-key.json')
          }}
        >
          Eject
        </SubmitButton>
      )
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

function downloadObjectAsJSON(value: any, filename: string) {
  const blob = new Blob([JSON.stringify(value)], {
    type: 'text/plain;charset=utf-8',
  })
  FileSaver.saveAs(blob, filename)
}
