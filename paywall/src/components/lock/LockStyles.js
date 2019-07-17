import styled from 'styled-components'
import Media from '../../theme/media'

export const LockWrapper = styled.li.attrs(props => ({
  className: 'lock',
  'data-address': props.lock.address,
}))`
  display: grid;
  justify-items: stretch;
  margin: 0px;
  padding: 0px;
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  width: 200px;
  grid-gap: 0px;
  background-clip: padding-box;
  grid-template-rows: 1fr 140px;
`

export const LockHeader = styled.header`
  display: grid;
  font-weight: 300;
  justify-content: center;
  align-content: center;
  text-align: center;
  font-size: 20px;
  min-height: 40px;
  border-radius: 4px 4px 0px 0px;
  padding: 0px;
  color: var(--grey);
`

export const LockFooter = styled.footer`
  display: grid;
  font-weight: 300;
  justify-content: center;
  align-content: center;
  font-size: 20px;
  line-height: 20px;
  height: 40px;
  border-radius: 0px 0px 4px 4px;
  padding: 0px;
  width: 200px;
`

export const LockBody = styled.div`
  display: grid;
  height: 140px;
  width: 200px;
  justify-content: center;
  justify-items: center;
  text-align: center;
  align-items: start;
  padding: 0px;
  grid-template-rows: 40px 30px;
  grid-gap: 8px;
  padding-top: 0px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: var(--white);
`

export const LockDetail = styled.div`
  white-space: nowrap;
  font-weight: ${props => (props.bold === true ? 'bold' : null)};
  align-content: center;
  align-items: center;
  align-self: center;
`

export const TransactionStatus = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  text-align: center;
  color: var(--dimgrey);
  font-size: 15px;
  font-weight: 300;
  padding: 0px;
`

export const LockDetails = styled.div`
  display: grid;
  font-size: 15px;
  grid-auto-columns: min-content;
  grid-auto-flow: column;
  color: var(--grey);
  font-weight: 300;
  grid-gap: 4px;
  align-self: center;
  justify-items: center;
  align-content: center;
`

export const LockName = styled(LockDetail)`
  white-space: normal;
  font-size: 12px;
`

export const Colophon = styled.footer`
  display: grid;
  grid-template-columns: 35px 1fr;
  grid-template-rows: 1fr 1fr;
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  font-size: 12px;
  color: var(--darkgrey);
  background-color: var(--white);
  justify-self: right;
  align-self: center;
  grid-row: 2;
  grid-column: 1;
  width: 120px;
  height: 80px;
  margin-right: -33px;

  & > a {
    grid-column: 2;
    grid-row: 2;
    color: var(--red);
    align-self: start;
  }
  & > p {
    grid-column: 2;
    grid-row: 1;
    color: var(--darkgrey);
    align-self: end;
    margin-bottom: 0;
  }

  & > p,
  & > a {
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    font-size: 12px;
  }
  & > div {
    grid-column: 1;
    grid-row: 1 / span 2;
    margin-left: -14px;
    align-self: center;
  }
  ${Media.phone`
    background-color: transparent;
    grid-template-columns: 1.2fr 18px 1fr;
    grid-template-rows: 30px;
    height: 30px;
    width: 100%;
    margin-right: 0;

    grid-row: 3;

    & > div {
      grid-row: 1;
      grid-column: 2;
      margin-left: 0;
      align-self: center;
    }

    & > p {
      width: 100%;
      color: var(--slate);
      grid-row: 1;
      grid-column: 1;
      text-align: right;
      margin-top: 0;
      align-self: center;
      padding-right: 2px;
    }

    & > a {
      grid-row: 1;
      grid-column: 3;
      justify-self: start;
      align-self: center;
    }
  `}
`
