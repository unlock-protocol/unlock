/* eslint-disable no-undef */

import React from 'react'
import styled from 'styled-components'
import Svg from '../svg'
import Media from '../../../theme/media'

export const Grid = styled.div`
  max-width: 896px;
  display: grid;
  grid-template-columns: repeat(12, [col-start] 1fr);
  grid-gap: 16px;
  & > * {
    grid-column: col-start / span 12;
  }
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
  threeQuarter: 9,
  half: 6,
  third: 4,
  quarter: 3,
}

type ColumnSize = 'full' | 'half' | 'third' | 'quarter' | 'threeQuarter'
interface ColumnProps {
  count: ColumnSize
}

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  & > :first-child {
    margin-top: auto;
  }
  @media (min-width: 500px) {
    grid-column: span ${(props: ColumnProps) => columnSpans[props.count]};
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

interface SubmitButtonProps {
  roundBottomOnly?: boolean
  backgroundColor?: string
}
export const SubmitButton = styled.button.attrs({ type: 'button' })`
  height: 48px;
  width: 100%;
  border: none;
  background-color: ${(props: SubmitButtonProps) =>
    props.backgroundColor || 'var(--green)'};
  border-radius: ${(props: SubmitButtonProps) =>
    props.roundBottomOnly ? '0 0 4px 4px' : '4px'};
  margin: 0;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: center;
  text-align: -webkit-center; /* Safari fix  */
  justify-content: center;
  color: var(--white);
  margin-top: 25px;
`

export const DisabledButton = styled(SubmitButton)`
  cursor: not-allowed;
  background-color: var(--grey);
`

interface ItemProps {
  title: string
  children: React.ReactNode
  count: ColumnSize
}
export const Item = ({ title, children, count }: ItemProps) => {
  if (!count) {
    count = 'half'
  }
  return (
    <Column count={count}>
      <ItemLabel>{title}</ItemLabel>
      {children}
    </Column>
  )
}

export const Description = styled.p`
  color: var(--slate);
  font-size: 16px;
  line-height: 21px;
`

export const Box = styled.div`
  width: 100%;
  border: thin var(--lightgrey) solid;
  padding: 16px;
  display: grid;
  grid-template-columns: 128px 1fr;
  ${SubmitButton} {
    margin-top: 16px;
    width: 384px;
    background-color: var(--red);
    &:hover {
      background-color: var(--sharpred);
    }
  }
  ${DisabledButton} {
    background-color: var(--grey);
    &:hover {
      background-color: var(--grey);
    }
  }
  ${Media.phone`
justify-items: center;
grid-template-columns: 1fr;
${SubmitButton} {
  width: 100%;
}
    `}
`

export const DangerHeader = styled.h1`
  color: var(--red);
  margin-top: 0;
`

export const SuperWarning = styled(SectionHeader)`
  display: block;
  color: var(--red);
  margin-bottom: 16px;
`

export const DangerIllustration = styled(Svg.Attention)`
  width: 96px;
  fill: var(--grey);
`

export const OrderedList = styled.ol`
  margin-top: 0px;
  list-style: decimal;
  font-size: 16px;
  li {
    color: var(--slate);
    margin-bottom: 10px;
  }
`

export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`

const Checkmark = styled(Svg.Checkmark)``

interface StyledCheckboxProps {
  checked: boolean
}

export const StyledCheckbox = styled.div<StyledCheckboxProps>`
  display: inline-block;
  width: 32px;
  height: 32px;
  background: ${(p) => (p.checked ? 'var(--white)' : 'var(--lightgrey)')};
  border: thin ${(p) => (p.checked ? 'var(--red)' : 'var(--lightgrey)')} solid;
  border-radius: 3px;
  margin-right: 16px;
  transition: all 100ms;
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px var(--blue);
  }
  ${Checkmark} {
    visibility: ${(p) => (p.checked ? 'visible' : 'hidden')};
  }
`

interface CheckboxProps {
  id: string
  checked: boolean
  onChange: () => void
}
export const Checkbox = ({ checked, onChange, id }: CheckboxProps) => (
  <div className="inline-block align-middle">
    <HiddenCheckbox id={id} checked={checked} onChange={onChange} />
    <StyledCheckbox checked={checked}>
      <Checkmark fill="var(--red)" />
    </StyledCheckbox>
  </div>
)

// TODO: steal input/button elements from other parts of app and integrate here
