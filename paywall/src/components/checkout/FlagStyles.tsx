import styled from 'styled-components'
import Media from '../../theme/media'

export const OptimisticLogo = styled.div`
  width: 44px;
  ${Media.phone`
    width: 47px;
  `}
`

export const Info = styled.a`
  width: 18px;
  height: 18px;

  ${Media.phone`
    grid-row: 1;
    grid-column: 3;
    margin-right: 0;
    justify-self: end;
    width: 16px;
    height: 16px;
  `}
`

export const ProgressBar = styled.div`
  width: 74px;
  height: 8px;
  background: var(--lightgrey);
  position: relative;
  grid-column: 2;

  ${Media.phone`
    align-self: center;
    width: 80%;
    margin-left: 10px;
  `}
`

interface Props {
  confirmations: number
  requiredConfirmations: number
}

export const Progress = styled(ProgressBar)<Props>`
  position: absolute;
  background: ${({ confirmations, requiredConfirmations }) => {
    if (confirmations >= requiredConfirmations) {
      return 'var(--green)}'
    }
    return 'var(--yellow)}'
  }};
  width: ${({ confirmations, requiredConfirmations }) => {
    const width = Math.min(
      Math.floor(confirmations * (74 / requiredConfirmations)),
      74
    )
    return `${width}px`
  }};
  ${Media.phone`
    align-self: start;
    margin-left: 0;
    width: ${({ confirmations, requiredConfirmations }: Props) => {
      const width = Math.min(
        Math.floor(confirmations * (100 / requiredConfirmations)),
        100
      )
      return `${width}%`
    }};
  `}
`

export const OptimisticFlag = styled.div`
  height: 20px;
  width: 338px;
  background: var(--white);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  font-size: 12px;

  & > p {
    font-size: 12px;
    margin: 0;
    color: var(--darkgrey);
  }

  & > a {
    height: 16px;
    width: 16px;
    & > svg {
      height: 16px;
      width: 16px;
    }
  }

  ${Media.phone`
    margin: auto;
    font-size: 12px;
    display: grid;
    height: 60px;
    width: 100%;
    grid-template-columns: 1fr 0.4fr 24px 1fr;
    grid-template-rows: 60px;
    align-items: center;

    & > ${Progress}, & > ${ProgressBar} {
      align-self: center;
    }

    & > p {
      font-size: 12px;
      margin: 0 0 2px;
      text-align: right;
    }
  `}
`

export const PoweredByUnlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  & > p {
    margin: 0;
  }
  & ${OptimisticLogo} {
    margin: 0 0 0 2px;
    padding: 2px 0 0;
  }
  ${Media.phone`
    & > div {
      grid-row: 1;
      grid-column: 2;
      margin-left: 0;
      align-self: center;
    }

    & > p {
      font-size: 12px;
      color: var(--slate);
      grid-row: 1;
      grid-column: 1;
      margin: 0;
      align-self: center;
      padding: 0 0 0 2px;
    }

    & > a {
      grid-row: 1;
      grid-column: 3;
      justify-self: start;
      align-self: center;
      color: var(--red);
    }
`}
`

export const ConfirmedKeyWrapper = styled.div`
  width: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
  align-self: start;
  grid-row: 2;
  ${Media.phone`
    align-self: initial;
    grid-row: 1;
    grid-column: 2;
  `}
`
