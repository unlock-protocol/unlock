import styled from 'styled-components'
import Media from '../../theme/media'

export const OptimisticLogo = styled.div`
  width: 20px;
  height: 20px;
  & > div {
    width: 20px;
    height: 20px;
  }
  ${Media.phone`
    width: 16px;
    height: 16px;
    & > div {
      width: 16px;
      height: 16px;
    }
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
  width: 274px;
  background: var(--white);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;

  & > p {
    font-size: 12px;
    margin: -2px 0 0 0;
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
    font-size: 10px;
    display: grid;
    height: 60px;
    width: 100%;
    grid-template-columns: 1.6fr 0.5fr 24px 1fr;
    grid-template-rows: 60px;
    align-items: center;

    & > ${OptimisticLogo} {
      display: none;
    }

    & > ${Progress}, & > ${ProgressBar} {
      align-self: center;
    }

    & > p {
      margin: 0 0 2px;
      text-align: right;
    }
  `}
`

export const PoweredByUnlock = styled.div`
  display: none;
  ${Media.phone`
    font-size: 10px;
    width: 170px;
    display: grid;
    grid-template-columns: 1fr 18px 1fr;
    grid-template-rows: 1fr;

    font-size: 12px;


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
      margin: 0;
      align-self: center;
      padding-right: 2px;
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
