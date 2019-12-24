import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Header from './Header'
import Footer from './Footer'
import { RoundedLogo } from './Logo'
import Media from '../../theme/media'
import { styles } from './modal-templates'
import { MessageBox } from './modal-templates/styles'
import { ActionButton } from './buttons/ActionButton'
import withConfig from '../../utils/withConfig'

export default function Layout({ forContent, title, children }) {
  const [tosAccepted, setTosAccepted] = useState(false)
  return (
    <Container>
      <Left>
        {!forContent && (
          <Link href="/">
            <a>
              <RoundedLogo />
            </a>
          </Link>
        )}
      </Left>
      <Content>
        <Header forContent={forContent} title={title} />
        {!tosAccepted && <Terms setTosAccepted={setTosAccepted} />}
        {children}
        {forContent && <Footer />}
      </Content>
      <Right />
    </Container>
  )
}

Layout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  forContent: PropTypes.bool,
}

Layout.defaultProps = {
  title: 'Unlock',
  children: null,
  forContent: false,
}

const Terms = withConfig(({ setTosAccepted, config }) => {
  return (
    <styles.Greyout>
      <TermsModal>
        <Message>
          No account required{' '}
          <span role="img" aria-label="stars">
            ✨
          </span>
          , but you need to agree to our{' '}
          <Link href={`${config.unlockStaticUrl}/terms`}>
            <a>Terms of Service</a>
          </Link>{' '}
          and{' '}
          <Link href="/privacy">
            <a>Privacy Policy</a>
          </Link>
          .
        </Message>
        <TosButton onClick={() => setTosAccepted(true)}>I agree</TosButton>
      </TermsModal>
    </styles.Greyout>
  )
})

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr minmax(280px, 4fr) 1fr;
  ${Media.phone`
    display: flex;
    padding-left: 6px;
    padding-right: 6px;
  `};
`

const TermsModal = styled(MessageBox)`
  padding: 16px;
  display: grid;
  grid-gap: 16px;
  ${Media.nophone`
    grid-template-columns: 1fr 120px;
  `}
  ${Media.phone`
    grid-template-columns: 1fr;
  `}
`

const TosButton = styled(ActionButton)`
  padding: 10px;
`

const Left = styled.div`
  display: grid;
  align-items: start;
  height: 24px;

  ${Media.phone`
    display: none;
  `};
`

const Right = styled.div`
  ${Media.phone`
    display: none;
  `};
`

const Content = styled.div`
  color: var(--darkgrey);
  display: grid;
  row-gap: 24px;
  width: 100%;
`

const Message = styled.p`
  margin: 0px;
  font-size: 16px;
`
