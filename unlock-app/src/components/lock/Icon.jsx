import React, { useContext, useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import { ConfigContext } from '../../utils/withConfig'
import { Transition, Dialog, Tab } from '@headlessui/react'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { MdOutlineClose as CloseIcon } from 'react-icons/md'
import { Button, Input } from '@unlock-protocol/ui'
import { useAccount } from '../../hooks/useAccount'
import InlineModal from '../interface/InlineModal'
import { IconModal } from '../interface/locks/Manage/elements/LockIcon'

const SvgCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 24 24">
    <path
      d="m401.94 543.64c-.422-.413-.932-.619-1.528-.619h-1.892l-.431-1.122c-.107-.27-.303-.502-.587-.697-.284-.195-.576-.293-.874-.293h-4.324c-.298 0-.59.098-.874.293-.284.195-.48.428-.587.697l-.431 1.122h-1.892c-.597 0-1.106.206-1.529.619-.422.413-.633.911-.633 1.494v7.395c0 .583.211 1.081.633 1.494.422.413.932.619 1.529.619h11.89c.597 0 1.106-.206 1.528-.619.422-.413.633-.911.633-1.494v-7.395c0-.583-.211-1.081-.633-1.494m-4.801 7.804c-.74.724-1.631 1.085-2.673 1.085-1.042 0-1.932-.362-2.673-1.085-.74-.724-1.111-1.594-1.111-2.612 0-1.018.37-1.889 1.111-2.612.74-.724 1.631-1.085 2.673-1.085 1.042 0 1.932.362 2.673 1.085.74.724 1.111 1.594 1.111 2.612 0 1.018-.37 1.889-1.111 2.612m-2.673-4.989c-.67 0-1.243.232-1.719.697-.476.465-.714 1.025-.714 1.68 0 .655.238 1.215.714 1.68.476.465 1.049.697 1.719.697.67 0 1.243-.232 1.719-.697.476-.465.714-1.025.714-1.68 0-.655-.238-1.215-.714-1.68-.476-.465-1.049-.697-1.719-.697"
      transform="matrix(.78637 0 0 .78395-302.25-421.36)"
      fill="#4d4d4d"
    />
  </svg>
)

/**
 * This generates a lock icon unique for each lock
 * It changes the colors of the 3 inner circles and applies a rotation and permutation of layer order
 * based on the lock address
 * @param {UnlockPropTypes.lock} lock
 */
export function Icon({ lock }) {
  const config = useContext(ConfigContext)
  const [isOpen, setIsOpen] = useState(false)
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
        <Overlay onClick={() => setIsOpen(true)}>
          <SvgCamera />
        </Overlay>
      )}
      <IconModal
        lockAddress={lock.address}
        network={lock.network}
        imageUrl={imageSrc}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        dismiss={(image) => {
          setIsOpen(false)
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

export default Icon
