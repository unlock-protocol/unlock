import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import Svg from '../../svg'
import Media from '../../../../theme/media'

export class HomepageButton extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      acceptedTerms: props.acceptedTerms,
    }
    this.acceptTerms = this.acceptTerms.bind(this)
  }

  acceptTerms() {
    this.setState(() => ({
      acceptedTerms: true,
    }))
  }

  render() {
    const { acceptedTerms } = this.state
    const { label, destination, children } = this.props

    const backgroundColor = 'var(--white)'
    const textColor = 'var(--brand)'

    return (
      <>
        {acceptedTerms !== true && (
          <DashboardButton
            onClick={this.acceptTerms}
            backgroundColor={backgroundColor}
            textColor={textColor}
          >
            {children}
            <span>{label}</span>
          </DashboardButton>
        )}
        {acceptedTerms === true && (
          <TermsBox backgroundColor={textColor} textColor={backgroundColor}>
            <Message>
              You need to agree to our&nbsp;
              <Link href="/terms">
                <a>Terms of Service</a>
              </Link>
              &nbsp;and&nbsp;
              <Link href="/privacy">
                <a>Privacy Policy</a>
              </Link>
            </Message>
            <Link href={destination}>
              <a>
                <DashboardButton
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                >
                  <Svg.Checkmark />
                  <span>I Agree</span>
                </DashboardButton>
              </a>
            </Link>
          </TermsBox>
        )}
      </>
    )
  }
}

const DashboardButton = styled.button`
  display: inline-block;
  width: 120px;
  height: 40px;
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  font-weight: 300;
  font-size: 13px;
  white-space: nowrap;
  text-align: left;
  border: none;
  border-radius: 4px;
  outline: none;
  transition: background-color 200ms ease;

  span {
    vertical-align: middle;
  }

  > svg {
    margin: 5px;
    vertical-align: middle;
    height: ${(props) => props.size || ' 24px'};
    width: ${(props) => props.size || ' 24px'};
  }

  color: ${(props) => props.textColor};
  background-color: ${(props) => props.backgroundColor};
  > svg {
    fill: ${(props) => props.textColor};
  }

  &:hover {
    color: ${(props) => props.backgroundColor};
    background-color: ${(props) => props.textColor};
    > svg {
      fill: ${(props) => props.backgroundColor};
    }
  }

  ${Media.phone`
    color: ${(props) => props.backgroundColor};
    background-color: ${(props) => props.textColor};
    > svg {
      fill: ${(props) => props.backgroundColor};
    }

    &:hover {
      color: ${(props) => props.textColor};
      background-color: ${(props) => props.backgroundColor};
      > svg {
        fill: ${(props) => props.textColor};
      }
    }
  `};
`

const TermsBox = styled.div`
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-template-columns: 220px auto;
  grid-gap: 0px;
  padding: 0px;
  font-family: IBM Plex Mono;
  font-size: 11px;

  color: ${(props) => props.textColor};
  a {
    color: ${(props) => props.textColor};
    text-decoration: underline;
    margin: 0px;
  }

  ${Media.phone`
  color: ${(props) => props.backgroundColor};
  a {
    color: ${(props) => props.backgroundColor};
  }

  `}
`

const Message = styled.div`
  padding: 5px;
`

HomepageButton.propTypes = {
  label: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  acceptedTerms: PropTypes.bool,
  children: PropTypes.node,
}

HomepageButton.defaultProps = {
  acceptedTerms: false,
  children: null,
}

export default HomepageButton
