import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import { ConfigContext } from '../../utils/withConfig'

import { AuthenticationContext } from '../../contexts/AuthenticationContext'

import { useAccount } from '../../hooks/useAccount'
import InlineModal from '../interface/InlineModal'
import {
  Button,
  LoadingButton,
  Input,
  Label,
  NeutralButton,
} from '../interface/checkout/FormStyles'

const SvgCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 24 24">
    <path
      d="m401.94 543.64c-.422-.413-.932-.619-1.528-.619h-1.892l-.431-1.122c-.107-.27-.303-.502-.587-.697-.284-.195-.576-.293-.874-.293h-4.324c-.298 0-.59.098-.874.293-.284.195-.48.428-.587.697l-.431 1.122h-1.892c-.597 0-1.106.206-1.529.619-.422.413-.633.911-.633 1.494v7.395c0 .583.211 1.081.633 1.494.422.413.932.619 1.529.619h11.89c.597 0 1.106-.206 1.528-.619.422-.413.633-.911.633-1.494v-7.395c0-.583-.211-1.081-.633-1.494m-4.801 7.804c-.74.724-1.631 1.085-2.673 1.085-1.042 0-1.932-.362-2.673-1.085-.74-.724-1.111-1.594-1.111-2.612 0-1.018.37-1.889 1.111-2.612.74-.724 1.631-1.085 2.673-1.085 1.042 0 1.932.362 2.673 1.085.74.724 1.111 1.594 1.111 2.612 0 1.018-.37 1.889-1.111 2.612m-2.673-4.989c-.67 0-1.243.232-1.719.697-.476.465-.714 1.025-.714 1.68 0 .655.238 1.215.714 1.68.476.465 1.049.697 1.719.697.67 0 1.243-.232 1.719-.697.476-.465.714-1.025.714-1.68 0-.655-.238-1.215-.714-1.68-.476-.465-1.049-.697-1.719-.697"
      transform="matrix(.78637 0 0 .78395-302.25-421.36)"
      fill="#4d4d4d"
    />
  </svg>
)

const IconModal = ({ active, dismiss, current, lockAddress, network }) => {
  const [url, setUrl] = useState(current)
  const [error, setError] = useState(null)
  const { account } = useContext(AuthenticationContext)
  const config = useContext(ConfigContext)
  const { updateLockIcon } = useAccount(account, network)

  const defaultIconUrl = `${config.services.storage.host}/lock/${lockAddress}/icon?original=1`

  const setImageUrlIfValid = (url) => {
    return new Promise((resolve, reject) => {
      setError(null)
      const image = new Image()
      image.onload = () => {
        if (image.width) {
          setUrl(image.src)
          resolve(true)
        } else {
          setError('This is not a valid image...')
          resolve(false)
        }
      }
      image.onerror = () => {
        setUrl(null)
        setError('This is not a valid image...')
        resolve(false)
      }
      image.src = url
    })
  }

  const imagePicked = async (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0]
      // Max size is 1MB
      if (file.size > 1024 * 1024) {
        setError(
          'This file is too large to be used. Please use a file that is at most 1MB, or use an external URL.'
        )
      } else {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          const dataUrl = reader.result
          const isValid = await setImageUrlIfValid(dataUrl)
          if (isValid) {
            setUrl(dataUrl)
          }
        }
      }
    }
  }

  const urlPicked = async (event) => {
    await setImageUrlIfValid(event.target.value)
  }

  const restoreDefault = () => {
    setUrl(defaultIconUrl)
  }

  const save = async () => {
    event.preventDefault()
    try {
      await updateLockIcon(lockAddress, network, url)
      dismiss(url)
    } catch (error) {
      console.error(error)
      setError('This image could not be saved. Please try again, or reach out.')
    }
    return false
  }

  const hiddenFileInput = React.useRef(null)

  const handleFileInputClick = (event) => {
    event.preventDefault()
    hiddenFileInput.current.click()
    return null
  }

  const resetAndDismiss = () => {
    setError('')
    dismiss(current)
  }

  return (
    <InlineModal width={350} active={active} dismiss={resetAndDismiss}>
      <Title>Customize the NFT</Title>
      <FullLockLogo alt="logo" src={url} />
      {error && <span className="mx-1 text-sm text-red-500">{error}</span>}
      <form>
        <Label htmlFor="inputFile">Choose a file</Label>
        <button
          className="flex justify-center p-2 items-items [background-color:var(--green)] text-white w-full rounded-lg hover:[background-color:var(--activegreen)] disabled:cursor-not-allowed disabled:[background-color:var(--grey)]"
          type="button"
          id="inputFile"
          onClick={handleFileInputClick}
        >
          Upload a file
        </button>
        <input
          accept="image/*"
          type="file"
          ref={hiddenFileInput}
          onChange={imagePicked}
          style={{ display: 'none' }}
        />
        <Label htmlFor="inputUrl">Or, enter a URL</Label>
        <Input
          style={{ marginBottom: '0px' }}
          id="inputUrl"
          type="text"
          onChange={urlPicked}
        />

        <Label htmlFor="restoreDefaultButton">Or</Label>
        <div className="flex flex-col gap-2 py-4">
          <button
            className="flex justify-center p-2 items-items [background-color:var(--green)] text-white w-full rounded-lg hover:[background-color:var(--activegreen)] disabled:cursor-not-allowed disabled:[background-color:var(--grey)]"
            id="restoreDefaultButton"
            type="button"
            onClick={restoreDefault}
          >
            Restore default
          </button>
          <button
            className="flex justify-center p-2 items-items [background-color:var(--green)] text-white w-full rounded-lg hover:[background-color:var(--activegreen)] disabled:cursor-not-allowed disabled:[background-color:var(--grey)]"
            disabled={error || !url}
            type="submit"
            onClick={save}
          >
            Save
          </button>
        </div>
      </form>
    </InlineModal>
  )
}

IconModal.propTypes = {
  active: PropTypes.bool.isRequired,
  dismiss: PropTypes.func.isRequired,
  current: PropTypes.string.isRequired,
  lockAddress: PropTypes.string,
  network: PropTypes.number,
}

IconModal.defaultProps = {
  lockAddress: '',
  network: 0,
}

/**
 * This generates a lock icon unique for each lock
 * It changes the colors of the 3 inner circles and applies a rotation and permutation of layer order
 * based on the lock address
 * @param {UnlockPropTypes.lock} lock
 */
export function Icon({ lock }) {
  const config = useContext(ConfigContext)
  const [modalShown, setModalShown] = useState(false)
  const [imageSrc, setImageSrc] = useState(
    lock.address
      ? `${config.services.storage.host}/lock/${lock.address}/icon`
      : '/images/svg/default-lock-logo.svg'
  )

  const handleError = () => {
    setImageSrc('/images/svg/default-lock-logo.svg')
  }

  return (
    <Wrapper>
      {lock.address && (
        <Overlay onClick={() => setModalShown(true)}>
          <SvgCamera />
        </Overlay>
      )}
      <IconModal
        lockAddress={lock.address}
        network={lock.network}
        current={imageSrc}
        active={modalShown}
        dismiss={(image) => {
          setModalShown(false)
          setImageSrc(image)
        }}
      />
      <LockLogo alt="logo" src={imageSrc} onError={handleError} />
    </Wrapper>
  )
}

Icon.propTypes = {
  lock: UnlockPropTypes.lock,
}

Icon.defaultProps = {
  lock: null,
}

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: none;
  opacity: 0.8;
  background-color: var(--grey);
  justify-content: center;
  align-items: center;
`

const ModalWrapper = styled.div`
  width: 320px;
  max-width: 320px;
  max-width: 320px;
`

const FullLockLogo = styled.img`
  max-height: 300px;
  max-width: 300px;
  width: 300px;
`

const LockLogo = styled.img`
  max-width: 48px;
`

const Wrapper = styled.div`
  border-radius: 50%;
  position: relative;

  overflow: hidden;

  height: 48px;
  width: 48px;

  display: flex;
  flex-direction: column;
  cursor: pointer;
  justify-content: center;
  align-items: center;

  &:hover {
    ${Overlay} {
      display: flex;
    }
  }
`

const Title = styled.h1`
  color: var(--grey);
  font-family: IBM Plex Sans;
`

export default Icon
