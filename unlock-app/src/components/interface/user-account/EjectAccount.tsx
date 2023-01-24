import React, { useContext } from 'react'
import FileSaver from 'file-saver'
import { EncryptedPrivateKey } from '../../../unlockTypes'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { Button } from '@unlock-protocol/ui'
import Svg from '../svg'

export function EjectAccount() {
  const { encryptedPrivateKey } = useContext(AuthenticationContext)
  if (!encryptedPrivateKey) {
    return null // Accounts for which we do not have the key cannot be ejected!
  }
  return (
    <div className="grid max-w-4xl gap-4 grid-cols-[repeat(12,[col-start]_1fr)">
      <div className="col-span-12 text-base font-bold leading-5">
        Export Account
      </div>
      <div className="flex flex-col content-end col-span-12">
        <p className="mt-auto text-base leading-5 text-black">
          Exporting your account will eject it from the Unlock platform. The
          following things will happen:
        </p>
        <div className="mt-0 text-base list-decimal">
          <li className="mb-2 text-brand-ui-secondary">
            A JSON file will be downloaded to your computer. This file includes
            your private key, encrypted with your{' '}
            <strong>Unlock password</strong>. You should then import it into a
            wallet like Metamask.
          </li>
          <li className="mb-2 text-brand-ui-secondary">
            Your Unlock account will be deleted permanently, including all
            personal information.
          </li>
          <li className="mb-2 text-brand-ui-secondary">
            After that, you will not be able to log back in with Unlock and the
            recovery link we sent by email will not work anymore either.
          </li>
        </div>
        <div className="w-full p-4 border border-gray-200 grid grid-cols-1 md:grid-cols-[128px_1fr] items-center md:items-start">
          <div>
            <Svg.Attention className="w-24 fill-gray-500" />
          </div>
          <div>
            <h1 className="mt-0 text-red-600">Danger Zone</h1>
            <div className="block col-span-12 mb-4 text-base font-bold leading-5 text-red-600">
              Clicking the eject button below is final. There is no way back
              after that. Do not delete the JSON file until you have safely
              imported it in another crypto wallet.
            </div>
            <EjectionForm
              download={downloadObjectAsJSON}
              encryptedPrivateKey={encryptedPrivateKey}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default EjectAccount

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
        <Button
          variant="outlined-primary"
          size="small"
          onClick={() => {
            download(encryptedPrivateKey, 'encrypted-private-key.json')
          }}
        >
          Eject
        </Button>
      )
    }
    return (
      <Button variant="outlined-primary" size="small" type="submit">
        Eject
      </Button>
    )
  }

  render() {
    const { checked } = this.state
    return (
      <form>
        <label
          className="flex items-center gap-2"
          htmlFor="ejection-confirmation-checkbox"
        >
          <input
            id="ejection-confirmation-checkbox"
            type="checkbox"
            checked={checked}
            className="w-8 h-8 text-red-600 bg-gray-200 border-gray-200 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={this.toggleChecked}
          />

          <div className="col-span-12 text-base font-bold leading-5">
            Yes, I want to export and delete my account
          </div>
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
