import styled from 'styled-components'
import Media from '../../theme/media'
import Address from '../interface/Address'

export const LockRowGrid =
  'grid-template-columns: 48px minmax(100px, 1fr) repeat(4, minmax(56px, 100px)) minmax(198px, 1fr);'

export const PhoneLockRowGrid =
  'grid-template-columns: 48px minmax(80px, 140px) repeat(2, minmax(56px, 80px)); grid-auto-flow: column;'

export const LockWarning = styled.div`
  padding-left: 8px;
  color: var(--sharpred);
  background-color: white;
  padding-top: 5px;

  a {
    color: var(--sharpred);
    text-decoration: underline;
  }
`

export const LockRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  color: var(--slate);
  font-size: 14px;
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  transition: box-shadow 100ms ease;
  border-radius: 4px;

  &:hover {
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }
`

export const LockDetails = styled.div`
  font-weight: 200;
  min-height: 48px;
  padding-left: 8px;
  color: var(--slate);
  display: grid;
  grid-row-gap: 0;
  ${Media.nophone`
  ${LockRowGrid} grid-template-rows: 84px;
  grid-column-gap: 16px;
`} ${Media.phone`
  grid-column-gap: 4px;
  ${PhoneLockRowGrid}
`}
  align-items: start;

  & > * {
    padding-top: 16px;
  }
`

export const LockLabel = styled.div`
  color: var(--link);
`

export const DoubleHeightCell = styled.div`
  grid-row: span 2;
`

export const BalanceContainer = styled.div``

export const LockName = styled.div.attrs({
  className: 'name',
})`
  color: var(--link);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  ${Media.phone`
  grid-column: span 2;
`};
`

export const LockAddress = styled(Address).attrs({
  className: 'address',
})`
  display: block;
  color: var(--grey);
  font-weight: 200;
  white-space: nowrap;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LockDuration = styled.div.attrs({
  className: 'duration',
})``

export const LockKeys = styled.div.attrs({
  className: 'keys',
})``

export const LockPanel = styled.div`
  grid-column: 1 / span 7;
  ${Media.phone`
  display: none;
`};
`

export const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
`
