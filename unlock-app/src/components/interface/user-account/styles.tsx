import React from 'react'
import styled from 'styled-components'

export const Grid = styled.div`
  max-width: 896px;
  display: grid;
  grid-template-columns: repeat(12, [col-start] 1fr);
  grid-gap: 16px;
  & > * {
    grid-column: col-start / span 12;
  }
`

export const GridPadding = styled.div`
  padding: 25px;
`

export const SectionHeader = styled.span`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  color: var(--slate);
`

const columnSpans = {
  full: 12,
  half: 6,
  third: 4,
}

type ColumnSize = 'full' | 'half' | 'third'
interface ColumnProps {
  size: ColumnSize
}

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  & > :first-child {
    margin-top: auto;
  }
  @media (min-width: 500px) {
    grid-column: span ${(props: ColumnProps) => columnSpans[props.size]};
  }
`

export const ItemLabel = styled.span`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 13px;
  display: flex;
  align-items: center;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--labelgrey);
`

// Meant for "small" data -- generally a single line of text
export const ItemValue = styled.span`
  margin: 1rem 0.5rem;
  height: 21px;
  display: flex;
  color: var(--slate);
`

export const Input = styled.input`
  height: 60px;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 1rem;
  width: 100%;
`

export const Error = styled.span`
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 1rem;
  margin-top: 13px;
`

interface SubmitButtonProps {
  roundBottomOnly?: boolean
}
export const SubmitButton = styled.button`
  height: 60px;
  border: none;
  background-color: var(--green);
  border-radius: ${(props: SubmitButtonProps) =>
    props.roundBottomOnly ? '0 0 4px 4px' : '4px'};
  margin-bottom: 1rem;
  margin-top: 13px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  color: var(--darkgrey);
`

export const FullWidthButton = styled(SubmitButton)`
  border-radius: 0 0 4px 4px;
`

export const Price = styled.span`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 30px;
  line-height: 39px;
  color: var(--slate);
  margin-bottom: 8px;
`

export const TimeRemaining = styled.span`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
  line-height: 26px;
  color: var(--grey);
`

export const CenterRow = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
`

interface LockInfoProps {
  price: string
  timeRemaining: string | JSX.Element
}
export const LockInfo = ({ price, timeRemaining }: LockInfoProps) => (
  <CenterRow>
    <Price>{price}</Price>
    <TimeRemaining>{timeRemaining}</TimeRemaining>
  </CenterRow>
)

export const DisabledButton = styled(SubmitButton)`
  cursor: disabled;
  background-color: var(--grey);
`

interface ItemProps {
  title: string
  children: React.ReactNode
  size?: ColumnSize
}
export const Item = ({ title, children, size }: ItemProps) => {
  size = size || 'half'
  return (
    <Column size={size}>
      <ItemLabel>{title}</ItemLabel>
      {children}
    </Column>
  )
}

// To be used when two credit card fields need to sit on the same line
export const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  grid-gap: 16px;
`

// To be used in place of <Layout> when we embed an app page in an iframe. This
// avoids including all the UI chrome and positioning, and adds a white
// background.
export const IframeLayout = styled.div`
  background-color: var(--offwhite);
  max-height: 100%;
  overflow-y: scroll;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  position: relative;
`

export const XYCenter = styled.div`
  background: rgba(0, 0, 0, 0.4) none repeat scroll 0% 0%;
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const IframeWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <XYCenter>
      <IframeLayout>{children}</IframeLayout>
    </XYCenter>
  )
}

// TODO: steal input/button elements from other parts of app and integrate here
