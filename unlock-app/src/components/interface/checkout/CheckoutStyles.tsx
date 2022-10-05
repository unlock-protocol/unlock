import React, { useContext } from 'react'
import styled from 'styled-components'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import { WordMarkLogo } from '../Logo'
import SvgComponents from '../svg'

interface CheckoutFooterProps {
  back: () => void
  showBack: boolean
  onLoggedOut: () => void
}

export const CheckoutFooter = ({
  showBack,
  back,
  onLoggedOut,
}: CheckoutFooterProps) => {
  const { account, deAuthenticate } = useContext(AuthenticationContext)

  let shortAddr = ''
  if (account) {
    shortAddr = `${account.substr(0, 5)}...${account.substr(
      account.length - 3,
      account.length
    )}`
  }

  const onDisconnect = () => {
    deAuthenticate()
    onLoggedOut()
  }

  return (
    <FooterWrapper>
      <Row>
        {showBack && (
          <BackButton onClick={back}>
            <SvgComponents.Arrow />
          </BackButton>
        )}
        {account && (
          <span>
            <abbr className="cursor-pointer" title={account}>
              {shortAddr}
            </abbr>
            <DisconnectButton onClick={onDisconnect}>x</DisconnectButton>
          </span>
        )}
      </Row>
      <Row>
        <span>
          Powered by
          <a
            href="https://unlock-protocol.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WordMark alt="Unlock" />
          </a>
        </span>
      </Row>
    </FooterWrapper>
  )
}

const DisconnectButton = styled.button`
  color: var(--grey);
  cursor: pointer;
  border: none;
  padding: 0px;
  margin-left: 4px;
  background-color: transparent;
  &:hover {
    color: var(--darkgrey);
  }
`

const Row = styled.div`
  bottom: 0px;
  font-size: 12px;
  color: var(--grey);
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
`

const FooterWrapper = styled.footer`
  bottom: 0px;
  margin-top: 44px;
  font-size: 12px;
  color: var(--grey);
  width: 100%;
  align-items: center;
  margin-bottom: 16px;
  & span:only-child {
    margin: 0 auto;
  }
`

const WordMark = styled(WordMarkLogo)`
  width: 48px;
  margin-bottom: -1px;
  margin-left: 4px;
`

const BackButton = styled.div`
  width: 30px;
  cursor: pointer;
  svg {
    transform: rotate(180deg);
    fill: var(--grey);
  }
`
