import styled from 'styled-components'

export const Section = styled.section.attrs((props) => ({
  id: props.anchor,
}))`
  margin-top: 50px;
  margin-bottom: 30px;
  &:before {
    display: block;
    content: '';
    width: 87px;
    height: 3px;
    background-color: var(--silver);
    margin-bottom: 16px;
  }
`

export const Title = styled.h1`
  margin-top: 0px;
  color: var(--dimgrey);
  font-size: 36px;
  font-weight: 700;
`

export const Headline = styled.p`
  font-size: 32px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  margin-top: 0px;
`

export const CallToAction = styled.div`
  font-size: 32px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
`

export const SubTitle = styled.h2`
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 500;
  font-size: 24px;
`

export const Paragraph = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  line-height: 28px;
`

export const UnorderedList = styled.ul`
  padding-left: 30px;
`

export const OrderedList = styled.ol`
  padding-left: 30px;
`

export const Strong = styled.strong``

export const Em = styled.em``

export const ListItem = styled.li`
  line-height: 28px;
  margin: 4px 0px 12px 4px;
  padding-left: 16px;
  font-family: 'IBM Plex Serif', serif;
  font-size: 16px;
  font-weight: 300;
`

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-gap: 42px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 22px;
  line-height: 1.5;
  color: var(--darkgrey);
`

export const Columns = styled.div`
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-gap: 24px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 16px;
  line-height: 1.5;
  color: var(--darkgrey);
  align-items: start;
  justify-content: center;
  text-align: center;
`

export const ThreeColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-gap: 24px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 16px;
  line-height: 1.5;
  color: var(--darkgrey);
  align-items: start;
  justify-content: center;
  text-align: center;
`

export const Column = styled.div`
  display: grid;
  justify-items: center;
`

export const ShortColumn = styled.div`
  display: grid;
  width: minmax(300px, 66%);
  max-width: 560px;
`
