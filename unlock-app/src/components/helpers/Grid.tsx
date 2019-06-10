import styled from 'styled-components'
import Media from '../../theme/media'

export const Grid = styled.div`
  max-width: 896px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 16px;
`

export const GridFull = styled.div`
  grid-column: span 12;
`

export const GridHalf = styled.div`
  grid-column: span 6;
  ${Media.phone`
    grid-column: span 12;
  `}
`

export const GridThird = styled.div`
  grid-column: span 4;
  ${Media.phone`
    grid-column: span 12;
  `}
`
