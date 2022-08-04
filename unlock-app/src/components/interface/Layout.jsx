import PropTypes from 'prop-types'
import React from 'react'
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
import useTermsOfService from '../../hooks/useTermsOfService'
import Loading from './Loading'

export default function Layout({ forContent, title, children }) {
  const { termsAccepted, saveTermsAccepted, termsLoading } = useTermsOfService()

  if (termsLoading) {
    return <Loading />
  }

  return (
    <div className="flex p-4 mx-auto md:max-w-screen-lg lg:max-w-screen-xl">
      <Content>
        <Header forContent={forContent} title={title} />
        {!termsAccepted && <Terms setTermsAccepted={saveTermsAccepted} />}
        {children}
        {forContent && <Footer />}
      </Content>
      <Right />
    </div>
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

const Terms = withConfig(({ setTermsAccepted, config }) => {
  return (
    <styles.Greyout>
      <TermsModal>
        <Message>
          No account required{' '}
          <span role="img" aria-label="stars">
            ✨
          </span>
          , but you need to agree to our{' '}
          <a href={`${config.unlockStaticUrl}/terms`}>Terms of Service</a> and{' '}
          <a href={`${config.unlockStaticUrl}/privacy`}>Privacy Policy</a>.
        </Message>
        <TermsButton onClick={() => setTermsAccepted(true)}>
          I agree
        </TermsButton>
      </TermsModal>
    </styles.Greyout>
  )
})

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

const TermsButton = styled(ActionButton)`
  height: 45px;
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
