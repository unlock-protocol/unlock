import styled from 'styled-components'
import Media from '../../theme/media'

export const H1 = styled.h1`
  font-size: 48px;
  font-family: IBM Plex Serif;
  font-weight: 500;
  margin-top: 0px;
  margin-bottom: 0px;
`

export const H2 = styled.h2`
  margin-top: 0px;
  font-size: 32px;
  margin-bottom: 0px;
  font-weight: 300;
`

export const H3 = styled.h3`
  font-family: IBM Plex Sans;
  font-size: 20px;
  letter-spacing: 1px;
  font-weight: 300;
  text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 8px;
`

export const H4 = styled.h4`
  font-family: IBM Plex Sans;
  font-size: 24px;
  text-align: center;
  color var(--darkgrey);
  margin: 8px;
`

export const Headline = styled.p`
  font-size: 32px;
  line-height: 42px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 100;
  margin-top: 50px;
  margin-bottom: 50px;
  padding-left: 5%;
  padding-right: 5%;
`

export const Icon = styled.span`
  display: inline-block;
  width: ${(props) => props.size || 24}px;
  height: ${(props) => props.size || 24}px;
  border-radius: 100%;
  margin-right: 16px;
`

export const ActionButtons = styled.div`
  display: flex;
  padding: 0px;
  margin-top: 32px;
  ${Media.phone`
    flex-direction: column;
  `};
`

export const ActionButton = styled.a`
  display: flex;
  align-items: center;
  font-size: 24px;
  color: ${(props) => props.color} !important;
  border: 1px solid ${(props) => props.borderColor || props.color};
  background-color: ${(props) => props.contrastColor};
  margin-right: 24px;
  padding: 12px;
  border-radius: 4px;
  transition: background-color 200ms ease;
  cursor: pointer;

  ${Media.phone`
    margin-right: 0px;
    margin-bottom: 24px;
  `};

  ${Icon} {
    background-color: ${(props) => props.color};
  }

  svg {
    fill: ${(props) => props.contrastColor};
  }

  &:hover {
    color: ${(props) => props.contrastColor} !important;
    background-color: ${(props) => props.color};
    ${Icon} {
      background-color: ${(props) => props.contrastColor};
    }
    svg {
      fill: ${(props) => props.color};
    }
  }
`

export const Box = styled.div`
  margin-top: 64px;
  background-color: ${(props) => props.color};
  color: ${(props) => props.contrastColor};
  padding: ${(props) => props.padding || 32}px;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: ${(props) => props.fontFamily || 'IBM Plex Sans'};
  border-radius: 8px;

  ${Media.phone`
    margin-top: 24px;
    padding: ${(props) => props.padding || 16}px;
  `}

  p {
    max-width: 800px;
    font-weight: 300;
    font-size: 24px;
    margin-top: 4px;
  }

  ${H2} {
    color: ${(props) => props.contrastColor};
    ${(props) =>
      props.hero &&
      `
      margin-top: 16px;
      margin-bottom: 32px;
    `}
  }
`
export const Columns = styled.div`
  display: flex;
  margin: 0px -16px;

  ${Media.phone`
    margin: 16px 0px;
    flex-direction: column;
  `};

  ${Media.tablet`
    margin: 16px 0px;
    flex-direction: column;
  `}
`

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 100%;
  width: ${(props) => props.width || '100%'};
  margin: 16px;

  p {
    font-family: IBM Plex Sans;
    font-weight: 300;
    font-size: 24px;
    text-align: center;
    color var(--darkgrey);
  }

  ${Media.phone`
    margin: 0px;
    margin-bottom: 8px;
    margin-top: 8px;
  `};

  ${H3} {
    color: var(--darkgrey);
    margin-bottom: 16px;
  }

`

export const BoxQuote = styled(Box)`
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;

  font-family: IBM Plex Sans;

  h4 {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--brand);
  }
`

export const Quote = styled.blockquote`
  padding: 0px;
  margin: 0px;
  font-family: IBM Plex Serif;
  font-size: 32px;
  color: var(--darkgrey);
`

export const Byline = styled.p`
  font-weight: 300;
  font-size: 24px;
  display: flex;
  vertical-align: middle;
  align-items: center;
  color: var(--darkgrey);
  ${Media.phone`
    flex-direction: column;
  `}
`

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 16px;
`
